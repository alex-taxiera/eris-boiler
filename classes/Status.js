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
     * StatusType data
     * @private
     * @type {StatusType}
     */
    this._type = new (require('./StatusType'))()
    /**
     * The interval for automatic status changes
     * @private
     */
    this._interval = undefined
  }
  /**
   * Set the status to the default.
   * @param {Client} bot The bot object.
   */
  default (bot) {
    const { name, type } = bot.config.DEFAULT.status
    this.setStatus(bot, { name, type })
  }
  /**
   * Stop changing status automatically
   */
  endRotate () {
    if (this._interval) this._interval = clearInterval(this._interval)
  }
  /**
   * Set the status of the bot
   * @param {Client} bot             The bot object.
   * @param {Object} [status]        Status to set to, if none is given it will be chosen at random
   * @param {String} [status.name]   Name of status
   * @param {Number} [status.type=0] Type of status. 0 is playing, 1 is streaming (Twitch only [Unsupported]), 2 is listening, 3 is watching.
   */
  async setStatus (bot, status) {
    if (!status.name) {
      status = this.current
      const statuses = await bot.dbm.getStatuses()
      if (statuses.length > 1) {
        while (status.name === this.current.name) {
          status = statuses[Math.round(Math.random() * (statuses.length - 1))]
        }
      } else {
        status = statuses[0]
      }
    }
    bot.logger.log(`${this._type.getStatusName(status.type)} ${status.name}`, 'cyan')
    bot.editStatus('online', status)
    this.current = status
  }
  /**
   * Set the status of the bot
   * @param {Client} bot The bot object.
   */
  startRotate (bot) {
    this._interval = setInterval(() => { this.setStatus(bot) }, 43200000)
  }
}

module.exports = Status
