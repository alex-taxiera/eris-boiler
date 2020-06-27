import { promises as fs } from 'fs'
import { ExtendedMap } from '@modules/extended-map'
import { KeysMatching } from '@utils/keys-matching'
import {
  Loadable,
} from './base'
import * as fileLoader from './file-loader'
import {
  LoadableTypeError,
  LoadableNotFoundError,
  LoadableBadKey,
} from './error'
import { Constructor } from '@utils/constructor'

export abstract class LoadableMap<
  T extends Loadable
> extends ExtendedMap<string, T> {

  protected toLoad: Array<T | string> = []
  protected reloadPaths: Array<string> = []

  protected onLoad? (loadable: T): unknown
  protected onReload? (oldLoadable: T, loadable: T): unknown

  constructor (
    private readonly _constructor: Constructor<T>,
    private readonly key: KeysMatching<T, string>,
  ) {
    super()
  }

  public add (
    ...loadables: Array<T | Array<T> | string | Array<string>>
  ): this {
    this.toLoad = this.toLoad.concat(
      loadables
        .reduce<Array<T | string>>((ax, dx) => ax.concat(
          Array.isArray(dx) ? dx : [ dx ],
        ), []),
    )

    return this
  }

  public async load (): Promise<this> {
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
      if (this.onLoad) {
        this.onLoad(loadable)
      }
    }

    return this
  }

  public async reload (): Promise<this> {
    for (const { filePath } of this.values()) {
      if (filePath) {
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
        if (this.onReload) {
          this.onReload(oldLoadableObject, loadable)
        }
      } else if (this.onLoad) {
        this.onLoad(loadable)
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
  protected async loadFiles (path: string): Promise<Array<T> | T> {
    this.reloadPaths.push(path)
    const file = await fs.stat(path)
    if (file.isDirectory()) {
      const loadables = await fileLoader.loadDirectory(path)
      const res = []
      for (const loadable of loadables) {
        if (!(loadable instanceof this._constructor)) {
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
      if (!(loadable instanceof this._constructor)) {
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
  private async resolveToLoad (): Promise<Array<T>> {
    const res = await Promise.all(this.toLoad.map(async (loadable) =>
      typeof loadable === 'string'
        ? this.loadFiles(loadable)
        : [ loadable ],
    ))

    this.toLoad = []

    return res.reduce<Array<T>>((ax, dx) => {
      if (Array.isArray(dx)) {
        return ax.concat(dx)
      } else {
        ax.push(dx)
      }
      return ax
    }, [])
  }

}
