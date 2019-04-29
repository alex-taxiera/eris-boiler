const types = {
  0: 'Playing',
  1: 'Streaming',
  2: 'Listening to',
  3: 'Watching'
}

module.exports.types = types

module.exports.getActivity = (type) => {
  if (!module.exports.isValidType(type)) {
    throw Error('Unknown type!')
  }
  return types[type]
}

module.exports.isValidType = (type) => {
  return types.hasOwnProperty(type)
}

module.exports.equalStatuses = (...statuses) => {
  try {
    const first = statuses.shift()
    return statuses.every((status) => {
      return first.name === status.name && first.type === status.type
    })
  } catch (e) {
    return false
  }
}

/**
 * @typedef  {Object}  Status
 * @property {String}  name   The name of the status.
 * @property {Number}  type   The data type of the status.
 */
