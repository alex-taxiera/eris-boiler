export function identity <T> (
  list: Array<T | null | undefined>,
): Array<T> {
  return list.filter((x) => x != null) as Array<T>
}
