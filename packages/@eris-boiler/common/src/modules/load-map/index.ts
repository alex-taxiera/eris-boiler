import { promises as fs } from 'fs'
import { join } from 'path'

import * as logger from '@modules/logger'
import { ExtendedMap } from '@modules/extended-map'

type Loadable<T> = string | T

export abstract class LoadMap<T> extends ExtendedMap<string, T> {
  protected toLoad: Array<Loadable<T>> = []

  protected abstract _load (loadableObject: T): Promise<void> | void

  public add (...loadables: Array<Loadable<T> | Array<Loadable<T>>>): this {
    this.toLoad.concat(loadables.flat())

    return this
  }

  public async load (): Promise<this> {
    const loadableObjects = await this.resolveToLoad()

    await Promise.all(
      loadableObjects.map(async (loadableObject) => this._load(loadableObject))
    )

    return this
  }

  /**
   * Load data files.
   * @param   path The path to the loadable file/directory.
   * @returns      The loadable objects loaded from file.
   */
  protected async loadFiles (path: string): Promise<Array<T>> {
    const file = await fs.stat(path)
    const files = file.isDirectory() ? await fs.readdir(path) : [ '' ]
    const res = []
    for (const fd of files) {
      const filePath = join(path, fd)
      if (
        (/(?<!\.(?:test|spec|d))\.[jt]sx?$/.exec(filePath)) ||
        (await fs.stat(filePath)).isDirectory()
      ) {
        try {
          let data = await import(filePath)
          if (data.__esModule) {
            data = data.default
          }
          if (!data.isIndex) {
            res.push(data)
          }
        } catch (e) {
          logger.error(
            `Unable to read ${path}/${fd}:\n\t\t\u0020${e}`
          )
        }
      }
    }

    return res
  }

  /**
   * Resolve loadable, be it path or array.
   * @param   loadable Parse a loadable to clean up any arrays or paths.
   * @returns          The cleaned loadable(s).
   */
  private async resolveToLoad (): Promise<Array<T>> {
    const ax = await Promise.all(this.toLoad.map(async (loadable) =>
      typeof loadable === 'string' ? this.loadFiles(loadable) : [ loadable ]
    ))

    this.toLoad = []

    return ax.flat()
  }
}
