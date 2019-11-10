/**
 * @extends Map<Key,T>
 */
class ExtendedMap extends Map {
  /**
   * Return the first object to make the function evaluate true.
   * @param   {FilterCallback<T>} func A function that takes an object and returns true if it matches.
   * @returns {T|void}                 The first matching item, or undefined if no match.
   */
  find (func) {
    for (const item of this.values()) {
      if (func(item)) {
        return item
      }
    }
    return undefined
  }

  /**
   * Return all the objects that make the function evaluate true.
   * @param   {FilterCallback<T>} func A function that takes an object and returns true if it matches.
   * @returns {Array<T>}               An array containing all the objects that matched.
   */
  filter (func) {
    const arr = []
    for (const item of this.values()) {
      if (func(item)) {
        arr.push(item)
      }
    }
    return arr
  }

  /**
   * Return an array with the results of applying the given function to each element.
   * @param   {MapCallback<T>} func A function that takes an object and returns something.
   * @returns {Array<R>}               An array containing the results.
   */
  map (func) {
    const arr = []
    for (const item of this.values()) {
      arr.push(func(item))
    }
    return arr
  }

  /**
   * Returns a value resulting from applying a function to every element of the collection.
   * @param   {ReduceCallback<T>} func           A function that takes the previous value and the next item and returns a new value.
   * @param   {T}                   [initialValue] The initial value passed to the function.
   * @returns {T}                                  The final result.
   */
  reduce (func, initialValue) {
    const iter = this.values()
    let val
    let result = initialValue === undefined ? iter.next().value : initialValue
    while ((val = iter.next().value) !== undefined) {
      result = func(result, val)
    }
    return result
  }

  /**
   * Returns true if all elements satisfy the condition.
   * @param   {FilterCallback<T>} func A function that takes an object and returns true or false.
   * @returns {boolean}                Whether or not all elements satisfied the condition.
   */
  every (func) {
    for (const item of this.values()) {
      if (!func(item)) {
        return false
      }
    }
    return true
  }

  /**
   * Returns true if at least one element satisfies the condition.
   * @param   {FilterCallback<T>} func A function that takes an object and returns true or false.
   * @returns {boolean}                Whether or not at least one element satisfied the condition.
   */
  some (func) {
    for (const item of this.values()) {
      if (func(item)) {
        return true
      }
    }
    return false
  }
}

module.exports = ExtendedMap

/**
 * @typedef {string|number} Key
 */

/**
 * @callback FilterCallback<T>
 * @param    {T}       item The item.
 * @returns  {boolean}
 */

/**
 * @callback MapCallback<T>
 * @param    {T} item The item.
 * @returns  {R}
 */

/**
 * @callback ReduceCallback<T>
 * @param    {R} accumulator The accumulator.
 * @param    {T} item        The item.
 * @returns  {R}
 */
