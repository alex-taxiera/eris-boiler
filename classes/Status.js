/**
 * Class representing the bot status.
 */
class Status {
  /**
   * Create a status.
   */
  constructor () {
    /**
     * The current status.
     * @type     {Object}
     * @property {String} name The name of the current status.
     * @property {Number} type The type of the current status.
     */
    this.current = { name: '', type: 1 }
    /**
     * Enum for status types
     * @type     {Object}
     * @property {String} 0 'Playing'
     * @property {String} 1 'Streaming' (Twitch only)
     * @property {String} 2 'Listening'
     * @property {String} 3 'Watching'
     */
    this.type = {
      0: 'Playing',
      1: 'Streaming',
      2: 'Listening',
      3: 'Watching'
    }
    /**
     * The interval for automatic status changes
     * @type {Timeout}
     */
    this.interval = undefined
  }
  /**
   * Set the status to the default.
   * @param {Client} bot The bot object.
   */
  default (bot) {
    this.setStatus(bot, bot.config.DEFAULT.status)
  }
  /**
   * Stop changing status automatically
   */
  endRotate () {
    if (this.interval) this.interval = clearInterval(this.interval)
  }
  /**
   * Set the status of the bot
   * @param {Client} bot             The bot object.
   * @param {Object} [status]        Status to set to, if none is given it will be chosen at random
   * @param {String} [status.name]   Name of status
   * @param {Number} [status.type=0] Type of status. 0 is playing, 1 is streaming (Twitch only [Unsupported]), 2 is listening, 3 is watching.
   */
  async setStatus (bot, { name, type = 0 }) {
    let status
    if (!name) {
      const statuses = (await bot.dbm.getGames()).map((status) => {
        return { name: status.name, type: status.type }
      })
      status = statuses[Math.round(Math.random() * (statuses.length - 1))]
      if (statuses.length > 1) {
        while (status.name === this.current.name) {
          status = statuses[Math.round(Math.random() * (statuses.length - 1))]
        }
      }
    }
    status = { name, type }
    bot.logger.log(`${this.type[status.type]} ${status.name}`, 'cyan')
    bot.editStatus('online', status)
    this.current = status
  }
  /**
   * Set the status of the bot
   * @param {Client} bot The bot object.
   */
  startRotate (bot) {
    this.interval = setInterval(() => { this.setStatus(bot) }, 43200000)
  }
}

module.exports = Status
