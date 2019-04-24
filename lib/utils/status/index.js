const types = {
  0: 'Playing',
  1: 'Streaming',
  2: 'Listening to',
  3: 'Watching'
}

function getActivity (type) {
  return types[type]
}

function isValidType (type) {
  return Object.keys(types).includes(type)
}

function equalStatuses (...statuses) {
  try {
    const first = statuses.shift()
    return statuses.every((status) => {
      return first.name === status.name && first.type === status.type
    })
  } catch (e) {
    return false
  }
}

module.exports = {
  types,
  getActivity,
  isValidType,
  equalStatuses
}

/**
 * @typedef  {Object}  Status
 * @property {String}  name   The name of the status.
 * @property {Number}  type   The data type of the status.
 */
