class StatusType {
  constructor () {
    /**
     * Enum for status types
     * @type     {Object}
     * @property {Number} PLAYING   0
     * @property {Number} STREAMING 1 (Twitch only)
     * @property {Number} LISTENING 2
     * @property {Number} WATCHING  3
     */
    this.num = {
      PLAYING: 0,
      STREAMING: 1,
      LISTENING: 2,
      WATCHING: 3
    }
  }
  /**
   * Get a status type string by num.
   * @param  {Number} num The number type to lookup.
   * @return {String}     The nice string name.
   */
  getStatusName (num) {
    const strings = {
      PLAYING: 'Playing',
      STREAMING: 'Streaming',
      LISTENING: 'Listening',
      WATCHING: 'Watching'
    }
    for (let key in this.num) {
      if (this.num[key] === num) return strings[key]
    }
  }
}

module.exports = StatusType
