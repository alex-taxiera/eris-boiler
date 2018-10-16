/**
 * Class representing bot status/presence.
 */
class Status extends require('../safe-class') {
  /**
   * Create a status.
   */
  constructor (name = '', type = 0) {
    /**
     * Enum for status types
     * @private
     * @type     {Object}
     * @property {Number} PLAYING   0
     * @property {Number} STREAMING 1 (Twitch only)
     * @property {Number} LISTENING 2
     * @property {Number} WATCHING  3
     */
    const _types = {
      0: 'Playing',
      1: 'Streaming',
      2: 'Listening to',
      3: 'Watching'
    }
    const mandatoryTypes = {
      name: 'string',
      type: 'number',
      activity: 'string'
    }
    const restraints = {
      type: Object.keys(_types).map((key) => parseInt(key))
    }
    super(mandatoryTypes, restraints)

    this.name = name
    this.type = type
    this.activity = _types[type]

    // verify types of properties match those defined in mandatoryTypes
    this._checkDataTypes()
  }
  /**
   * Compare two Statuses for equality
   * @param  {Status}  status1 The first Status.
   * @param  {Status}  status2 The second Status.
   * @return {Boolean}         Whether or not the two Statuses are equal.
   */
  static equals (status1, status2) {
    const vals1 = Object.values(status1)
    return Object.values(status2).every((value, index) => value === vals1[index])
  }
}

module.exports = Status
