import {
  Expand,
  UnionToIntersection,
  Awaited,
} from '@eris-boiler/common'

export type ArgResolver<T> = (str: string) => T | undefined

export interface CommandParamOptions<T> {
  resolver?: ArgResolver<T>
  required?: boolean
}

export class CommandParam<N extends string = string, T = unknown> {

  public readonly resolve: ArgResolver<T>
  public readonly required: boolean

  constructor (
    public readonly name: N,
    options?: CommandParamOptions<T>,
  ) {
    this.resolve = options?.resolver ?? (<T>(x: T) => x) as ArgResolver<T>
    this.required = options?.required ?? false
  }

}

export type ParseArgs<T extends readonly CommandParam<string, string>[]> =
  Expand<UnionToIntersection<{
    [K in keyof T]: T[K] extends CommandParam<infer N, infer R>
      ? { [K2 in N]: Awaited<R> }
      : never
  }[number]>>
