export class LoadableTypeError extends Error {

  constructor (filePath: string) {
    super(`Loadable is not correct type. Path: ${filePath}`)
  }

}

export class LoadableNotFoundError extends Error {

  constructor (filePath: string) {
    super(`Loadable not found at path "${filePath}"`)
  }

}

export class LoadableBadKey extends Error {

  constructor (filePath: string, key: string) {
    super(`Loadable expected to have key "${key}". Path: ${filePath}`)
  }

}
