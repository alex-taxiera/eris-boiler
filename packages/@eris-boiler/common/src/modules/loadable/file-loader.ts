import {
  promises as fs,
} from 'fs'
import { join } from 'path'
import {
  identity,
} from '@utils/identity'
import { FILE_REGEXP } from './constants'

export type LoadedFile = Record<string, unknown> & {filePath: string}

export async function load (path: string): Promise<LoadedFile | undefined>
export async function load (path: Array<string>): Promise<Array<LoadedFile>>
export async function load (
  path: string | Array<string>
): Promise<LoadedFile | Array<LoadedFile>>
export async function load (
  path: string | Array<string>,
): Promise<LoadedFile | undefined | Array<LoadedFile>> {
  const loader = async (str: string): Promise<LoadedFile | undefined> => {
    const fd = await fs.stat(str)

    const importName = fd.isDirectory()
      ? str
      : FILE_REGEXP.exec(str)?.[0]

    if (!importName) {
      return undefined
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await import(importName)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const obj = (data.__esmModule ? data.default : data) as LoadedFile
    obj.filePath = str

    return obj
  }

  return Array.isArray(path)
    ? identity(await Promise.all(path.map((p) => loader(p))))
    : loader(path)
}

export function unload (path: string | Array<string>): void {
  const paths = Array.isArray(path) ? path : [ path ]
  for (const p of paths) {
    delete require.cache[require.resolve(p)]
  }
}

export function reload (
  path: string | Array<string>,
): Promise<LoadedFile | Array<LoadedFile>> {
  unload(path)
  return load(path)
}

export async function loadDirectory (
  path: string,
): Promise<Array<LoadedFile>> {
  const files = await fs.readdir(path)
  const res = []
  for (const fd of files) {
    res.push(await load(join(path, fd)))
  }

  return identity(res)
}

export async function unloadDirectory (path: string): Promise<void> {
  const files = await fs.readdir(path)
  unload(files)
}

export async function reloadDirectory (
  path: string,
): Promise<Record<string, LoadedFile>> {
  const files = await fs.readdir(path)
  const res: Record<string, LoadedFile> = {}
  for (const fd of files) {
    const filePath = join(path, fd)
    unload(filePath)
    const loadable = await load(filePath)
    if (loadable) {
      res[filePath] = loadable
    }
  }

  return res
}
