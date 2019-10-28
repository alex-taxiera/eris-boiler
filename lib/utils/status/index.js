const types = {
  0: 'Playing',
  1: 'Streaming',
  2: 'Listening to',
  3: 'Watching'
}

module.exports.types = types

module.exports.getActivity = (type) => {
  if (!module.exports.isValidType(type)) {
    return
  }
  return types[type]
}

module.exports.isValidType = (type) => {
  return types.hasOwnProperty(type)
}

module.exports.equalStatuses = (...statuses) => {
  if (
    statuses.length < 2 ||
    !statuses.every((status) => {
      try {
        return typeof status.name === 'string' &&
        typeof status.type === 'number'
      } catch (e) {
        return false
      }
    })
  ) {
    return
  }

  const first = statuses.shift()
  return statuses.every(
    (status) => first.name === status.name && first.type === status.type
  )
}

/**
 * @typedef  Status
 * @property {string} name   The name of the status.
 * @property {number} type   The data type of the status.
 */
