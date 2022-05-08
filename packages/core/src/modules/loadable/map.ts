import { promises as fs } from 'fs'
import {
  ExtendedMap,
  KeysMatching,
  MaybeArray,
} from '@hephaestus/utils'

import { Loadable } from './base'
import * as fileLoader from './file-loader'
import {
  LoadableTypeError,
  LoadableNotFoundError,
  LoadableBadKey,
} from './error'

export abstract class LoadableMap<
A, T extends A & Loadable = A & Loadable,
> extends ExtendedMap<string, T> {

  protected toLoad: Array<T | string> = []

  protected reloadPaths: string[] = []

  protected onLoad? (loadable: T): unknown
  protected onReload? (oldLoadable: T, loadable: T): unknown

  protected abstract isValid (
    loadable: unknown,
  ): loadable is T

  constructor (
    private readonly key: KeysMatching<T, string>,
  ) {
    super()
  }

  public add (
    ...loadables: Array<MaybeArray<T | string>>
  ): this {
    this.toLoad = this.toLoad.concat(
      loadables
        .reduce<Array<T | string>>((ax, dx) => ax.concat(
        Array.isArray(dx) ? dx : [ dx ],
      ), []),
    )

    return this
  }

  public async load (onLoad?: (loadable: T) => unknown): Promise<this> {
    const loadables = await this.resolveToLoad()

    for (const loadable of loadables) {
      const key = loadable[this.key]
      if (typeof key !== 'string') {
        throw new LoadableBadKey(
          loadable.filePath ?? '',
          this.key.toString(),
        )
      }

      this.set(key, loadable)
      ;(onLoad ?? this.onLoad)?.(loadable)
    }

    return this
  }

  public async reload (
    onLoad?: (loadable: T) => unknown,
    onReload?: (loadable: T) => unknown,
  ): Promise<this> {
    for (const { filePath } of this.values()) {
      if (filePath != null) {
        fileLoader.unload(filePath)
      }
    }
    const oldToLoad = this.toLoad

    this.toLoad = this.reloadPaths

    const loadables = await this.resolveToLoad()

    for (const loadable of loadables) {
      const key = loadable[this.key]
      if (typeof key !== 'string') {
        throw new LoadableBadKey(
          loadable.filePath ?? '',
          this.key.toString(),
        )
      }

      this.set(key, loadable)

      const oldLoadableObject = this
        .find((old) => old.filePath === loadable.filePath)

      if (oldLoadableObject) {
        this.delete(oldLoadableObject[this.key] as unknown as string)
        ;(onReload ?? this.onReload)?.(oldLoadableObject, loadable)
      } else {
        (onLoad ?? this.onLoad)?.(loadable)
      }
    }

    this.toLoad = oldToLoad

    return this
  }

  /**
   * Load data files.
   * @param   path The path to the loadable file/directory.
   * @returns      The loadable objects loaded from file.
   */
  protected async loadFiles (path: string): Promise<MaybeArray<T>> {
    this.reloadPaths.push(path)
    const file = await fs.stat(path)
    if (file.isDirectory()) {
      const loadables = await fileLoader.loadDirectory(path)
      const res: T[] = []
      for (const loadable of loadables) {
        if (!this.isValid(loadable)) {
          throw new LoadableTypeError(loadable.filePath)
        }
        res.push(loadable)
      }

      return res
    } else {
      const loadable = await fileLoader.load(path)
      if (!loadable) {
        throw new LoadableNotFoundError(path)
      }
      if (!this.isValid(loadable)) {
        throw new LoadableTypeError(path)
      }

      return loadable
    }
  }

  /**
   * Resolve loadable, be it path or array.
   * @param   loadable Parse a loadable to clean up any arrays or paths.
   * @returns          The cleaned loadable(s).
   */
  private async resolveToLoad (): Promise<T[]> {
    const res = await Promise.all(this.toLoad.map((loadable) =>
      typeof loadable === 'string'
        ? this.loadFiles(loadable)
        : [ loadable ],
    ))

    this.toLoad = []

    return res.reduce<T[]>((ax, dx) => {
      if (Array.isArray(dx)) {
        return ax.concat(dx)
      } else {
        ax.push(dx)
      }
      return ax
    }, [])
  }

}
