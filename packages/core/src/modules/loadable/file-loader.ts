import { promises as fs } from 'fs'
import { join } from 'path'
import { identity, MaybeArray } from '@hephaestus/utils'
import { FILE_REGEXP } from './constants'
import { Loadable } from './base'

export type LoadedFile = Required<Loadable>

export async function load(path: string): Promise<LoadedFile | undefined>
export async function load(path: string[]): Promise<LoadedFile[]>
export async function load(
  path: MaybeArray<string>
): Promise<MaybeArray<LoadedFile>>
export async function load(
  path: string | string[]
): Promise<MaybeArray<LoadedFile> | undefined> {
  const loader = async (str: string): Promise<LoadedFile | undefined> => {
    const fd = await fs.stat(str)

    const importName = fd.isDirectory() ? str : FILE_REGEXP.exec(str)?.[0]

    if (importName == null) {
      return undefined
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await import(importName)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const obj = (data.default ?? data) as LoadedFile
    obj.filePath = str

    return obj
  }

  return Array.isArray(path)
    ? identity(await Promise.all(path.map(async (p) => await loader(p))))
    : await loader(path)
}

export function unload(path: string | string[]): void {
  const paths = Array.isArray(path) ? path : [path]
  for (const p of paths) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete require.cache[require.resolve(p)]
  }
}

export async function reload(
  path: string | string[]
): Promise<MaybeArray<LoadedFile>> {
  unload(path)
  return await load(path)
}

export async function loadDirectory(path: string): Promise<LoadedFile[]> {
  const files = await fs.readdir(path)
  const res = []
  for (const fd of files) {
    res.push(await load(join(path, fd)))
  }

  return identity(res)
}

export async function unloadDirectory(path: string): Promise<void> {
  const files = await fs.readdir(path)
  unload(files)
}

export async function reloadDirectory(
  path: string
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
