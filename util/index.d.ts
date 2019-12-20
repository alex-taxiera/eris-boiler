declare module 'eris-boiler/util'

declare type Key = string | number

declare type FilterCallback<T> = (item: T) => boolean

declare class ExtendedMap<Key, T> extends Map<Key,T> {
  find(func: FilterCallback<T>): T | void
  filter(func: FilterCallback<T>): T[]
  map<R>(func: (item: T) => R): R[]
  reduce(func: (accumulator: T, item: T) => T, initialValue?: T): T
  reduce<R>(func: (accumulator: R, item: T) => R, initialValue: R): R
  every(func: FilterCallback<T>): boolean
  some(func: FilterCallback<T>): boolean
}

declare type Status = {
  name: string
  type: number
}
