export function unknownHasKey<T extends string> (
  value: unknown,
  key: T,
): value is { [K in T]: unknown } {
  return value != null && typeof value === 'object' && key in value
}
