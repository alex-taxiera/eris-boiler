export type Constructor<T> = new (...args: any[]) => T

export type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never
}[keyof T]

export type Identity<T> = { [P in keyof T]: T[P] }

// Expand makes TS combine intersections
export type Primitive =
  string | number | boolean | bigint | symbol | null | undefined
export type Expand<T> = T extends Primitive ? T : { [K in keyof T]: T[K] }

// Standard impl from https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends ((k: infer I) => void) ? I : never

export type Awaited<T> = T extends PromiseLike<infer R> ? R : T

export type RemoveIndex<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : K
  ]: T[K]
}

export type KnownKeys<T> = keyof RemoveIndex<T>

export type MaybeArray<T> = T | T[]

export type MaybePromise<T> = T | Promise<T>
