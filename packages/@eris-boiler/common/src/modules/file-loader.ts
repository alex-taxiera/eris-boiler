/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import {
  promises as fs,
} from 'fs'
import { join } from 'path'

export async function load (path: string): Promise<any>
export async function load (path: Array<string>): Promise<Array<any>>
export async function load (
  path: string | Array<string>,
): Promise<any | Array<any>>
export async function load (
  path: string | Array<string>,
): Promise<any | Array<any>> {
  const loader = async (str: string): Promise<any> => {
    const fd = await fs.stat(str)

    const importName = fd.isDirectory()
      ? str
      : /^(?!.*\.(?:d|spec|test)\.[jt]s$).*(?=\.[jt]s$)/.exec(str)?.[0]

    if (!importName) {
      throw Error('Unsupported file type!')
    }
    const data = await import(importName)
    return data.__esmModule ? data.default : data
  }

  return Array.isArray(path) ? path.map((p) => loader(p)) : loader(path)
}

export function unload (path: string | Array<string>): void {
  const paths = Array.isArray(path) ? path : [ path ]
  for (const p of paths) {
    delete require.cache[require.resolve(p)]
  }
}

export function reload (
  path: string | Array<string>,
): Promise<any | Array<any>> {
  unload(path)
  return load(path)
}

export async function loadDirectory (
  path: string,
): Promise<Record<string, any>> {
  const files = await fs.readdir(path)
  const res: Record<string, any> = {}
  for (const fd of files) {
    const filePath = join(path, fd)
    res[filePath] = await load(filePath)
  }

  return res
}

export async function unloadDirectory (path: string): Promise<void> {
  const files = await fs.readdir(path)
  unload(files)
}

export async function reloadDirectory (
  path: string,
): Promise<Record<string, any>> {
  const files = await fs.readdir(path)
  const res: Record<string, any> = {}
  for (const fd of files) {
    const filePath = join(path, fd)
    unload(filePath)
    res[filePath] = await load(filePath)
  }

  return res
}
