export class ExtendedMap<Key, T> extends Map<Key, T> {
  public find(func: (item: T) => boolean): T | undefined {
    for (const item of this.values()) {
      if (func(item)) {
        return item
      }
    }

    return undefined
  }

  public filter(func: (item: T) => boolean): T[] {
    const arr = []

    for (const item of this.values()) {
      if (func(item)) {
        arr.push(item)
      }
    }

    return arr
  }

  public map<R>(func: (item: T) => R): R[] {
    const arr = []

    for (const item of this.values()) {
      arr.push(func(item))
    }

    return arr
  }

  public reduce<R>(func: (accumulator: R, item: T) => R, initialValue: R): R
  public reduce(func: (accumulator: T, item: T) => T, initialValue?: T): T {
    const iter = this.values()
    let current: IteratorResult<T, T> = iter.next()
    let result = initialValue ?? current.value

    while (!current.done) {
      result = func(result, current.value)
      current = iter.next()
    }

    return result
  }

  public every(func: (item: T) => boolean): boolean {
    for (const item of this.values()) {
      if (!func(item)) {
        return false
      }
    }

    return true
  }

  public some(func: (item: T) => boolean): boolean {
    for (const item of this.values()) {
      if (func(item)) {
        return true
      }
    }

    return false
  }
}
