import {
  KnownKeys,
  UnionToIntersection,
} from '@eris-boiler/common'

export type ArgResolver<T> = (str: string) => T | undefined

export interface CommandParam<
  N extends string = string,
  T = unknown,
  R = boolean
> {
  readonly name: N
  readonly resolve: ArgResolver<T>
  readonly required?: R
}

export type ParseArgs<
  T extends readonly CommandParam[]
> = UnionToIntersection<{
  // eslint-disable-next-line no-use-before-define
  [P in keyof T]: T[P] extends CommandParam<infer N, infer T, infer R>
    ? R extends true
      ? { [_ in N]: T }
      : { [_ in N]?: T }
    : never;
}[number]>

export type ActualArgs<
  T extends readonly CommandParam[]
> = KnownKeys<ParseArgs<T>> extends never ? never : ParseArgs<T>
