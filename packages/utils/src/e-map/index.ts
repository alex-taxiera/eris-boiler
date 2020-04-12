type FilterCallback<T> = (item: T) => boolean

export class ExtendedMap<Key, T> extends Map<Key, T> {
  public find (func: FilterCallback<T>): T | void {
    for (const item of this.values()) {
      if (func(item)) {
        return item
      }
    }

    return undefined
  }

  public filter (func: FilterCallback<T>): T[] {
    const arr = []

    for (const item of this.values()) {
      if (func(item)) {
        arr.push(item)
      }
    }

    return arr
  }

  public map<R> (func: (item: T) => R): R[] {
    const arr = []

    for (const item of this.values()) {
      arr.push(func(item))
    }

    return arr
  }

  public reduce<R> (func: (accumulator: R, item: T) => R, initialValue: R): R
  public reduce (func: (accumulator: T, item: T) => T, initialValue?: T): T {
    const iter = this.values()
    let val
    let result = initialValue === undefined ? iter.next().value : initialValue

    while ((val = iter.next().value) !== undefined) {
      result = func(result, val)
    }

    return result
  }

  public every (func: FilterCallback<T>): boolean {
    for (const item of this.values()) {
      if (!func(item)) {
        return false
      }
    }

    return true
  }

  public some (func: FilterCallback<T>): boolean {
    for (const item of this.values()) {
      if (func(item)) {
        return true
      }
    }

    return false
  }
}
