/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { promises as fs } from 'fs'
import { join } from 'path'

import * as logger from '@modules/logger'
import { ExtendedMap } from '@modules/extended-map'

type Loadable<T> = string | T

export abstract class LoadMap<T> extends ExtendedMap<string, T> {

  protected toLoad: Array<Loadable<T>> = []
  protected reloadables: {[k: string]: any} = {}

  protected abstract _load (loadableObject: any): Promise<void> | void
  protected abstract _reload (
    oldLoadableObject: any,
    loadableObject: any,
  ): Promise<void> | void

  constructor (
    private readonly reloadable = true,
  ) {
    super()
  }

  public add (...loadables: Array<Loadable<T> | Array<Loadable<T>>>): this {
    this.toLoad = this.toLoad.concat(
      loadables
        .reduce<Array<Loadable<T>>>((ax, dx) => ax.concat(
          Array.isArray(dx) ? dx : [ dx ],
        ), []),
    )

    return this
  }

  public async load (): Promise<this> {
    const loadableObjects = await this.resolveToLoad()

    await Promise.all(
      loadableObjects.map(async (loadableObject) => this._load(loadableObject)),
    )

    return this
  }

  public async reload (): Promise<this> {
    const reloadPaths = Object.keys(this.reloadables)
    for (const reloadable of reloadPaths) {
      delete require.cache[reloadable]
    }
    const oldToLoad = this.toLoad
    const oldReloadables = { ...this.reloadables }
    this.toLoad = reloadPaths
    this.reloadables = {}

    await this.resolveToLoad()

    await Promise.all(
      Object.keys(this.reloadables).map(
        async (path) =>
          this._reload(oldReloadables[path], this.reloadables[path]),
      ),
    )

    this.toLoad = oldToLoad

    return this
  }

  /**
   * Load data files.
   * @param   path The path to the loadable file/directory.
   * @returns      The loadable objects loaded from file.
   */
  protected async loadFiles (path: string): Promise<Array<any>> {
    const file = await fs.stat(path)
    const files = file.isDirectory() ? await fs.readdir(path) : [ '' ]
    const res = []

    for (const fd of files) {
      const filePath = join(path, fd)
      const importName = /^(?!.*\.(?:d|spec|test)\.ts$).*(?=\.ts$)/.exec(filePath)?.[0]
      if (
        (importName) ||
        (await fs.stat(filePath)).isDirectory()
      ) {
        try {
          const data = await import(importName ?? filePath)
          const obj = data.__esModule ? data.default : data
          res.push(obj)

          if (this.reloadable) {
            this.reloadables[filePath] = obj
          }
        } catch (e) {
          logger.error(
            `Unable to read ${path}${fd ? `/${fd}` : ''}:\n\t\t\u0020${
              (e as Error).toString()
            }`,
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
  private async resolveToLoad (): Promise<Array<any | T>> {
    const ax = await Promise.all(this.toLoad.map(async (loadable) =>
      typeof loadable === 'string'
        ? this.loadFiles(loadable)
        : [ loadable ],
    ))

    this.toLoad = []

    return ax.flat()
  }

}
