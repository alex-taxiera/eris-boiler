export function identity<T>(list: Array<T | null | undefined>): T[] {
  return list.filter((x) => x != null) as T[]
}
