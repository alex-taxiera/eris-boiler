const {
  status: {
    isValidType,
    getActivity,
    equalStatuses
  },
  logger
} = require('../utils')

/**
 * A class representing a StatusManager.
 */
class StatusManager {
  /**
   * Create a StatusManager
   * @param {DatabaseManager}      databaseManager The DatabaseManager used to fetch statuses.
   * @param {StatusManagerOptions} [options={}]    StatusManagerOptions.
   */
  constructor (bot, databaseManager, {
    mode = 'manual',
    interval = 43200000,
    defaultStatus
  } = {}) {
    this._bot = bot
    /**
     * @type    {DatabaseManager} The DatabaseManager used to fetch statuses.
     * @private
     */
    this._dbm = databaseManager
    /**
     * @type    {String} The mode of the StatusManager, either 'manual' or 'random'.
     * @private
     */
    this._mode = mode
    /**
     * The amount of time to wait before randomly changing status.
     * @type    {Number}
     * @private
     */
    this._interval = interval
    /**
     * @type {Status} The current Status of the bot.
     */
    this.defaultStatus = defaultStatus
    /**
     * @type {Status} The current Status of the bot.
     */
    this.current = null
    /**
     * @type    {Timeout} The timer for automatically switching statuses.
     * @private
     */
    this._timer = null
  }

  async initialize () {
    const [ defaultStatus ] = await this._dbm.newQuery('status')
      .equalTo('name', this.defaultStatus.name)
      .equalTo('type', this.defaultStatus.type)
      .find()
    if (!defaultStatus) {
      await this._dbm.newObject('status').save({
        name: this.defaultStatus.name,
        type: this.defaultStatus.type
      })
    }
    if (this._mode === 'random') {
      this.timerStart()
    }
    return this.setStatus(this.defaultStatus)
  }

  getStatuses () {
    return this._dbm.newQuery('status').find()
  }

  findStatusByName (name) {
    return this._dbm.newQuery('status').equalTo('name', name).find()
  }

  async addStatus (status) {
    const [
      oldStatuses,
      dbStatus
    ] = await Promise.all([
      this.getStatuses(), this._dbm.add('status', status)
    ])

    if (oldStatuses.length === 0) {
      return this.setStatus(dbStatus.toJSON())
    } else if (
      oldStatuses.length === 1 && !this._timer && this._mode === 'random'
    ) {
      this.timerStart()
    }
  }

  async deleteStatus (dbStatus) {
    if (equalStatuses(dbStatus.toJSON(), this.current)) {
      this.current = null
    }
    await dbStatus.delete()
    const statuses = await this.getStatuses()
    let nextStatus
    if (statuses.length === 0) {
      nextStatus = this.defaultStatus
    }
    this.setStatus(nextStatus)
  }

  /**
   * Set the status of the bot.
   * @param {Status} [status] Status to set to, if none is given and mode is random, it will randomly change.
   */
  async setStatus (status) {
    if (status && typeof status.name === 'string') {
      if (typeof status.type !== 'number' || !isValidType(status.type)) {
        status.type = 0
      }
    } else {
      status = null
      switch (this._mode) {
        case 'random':
          status = await this._randomStatus()
          break
        case 'manual':
        default: return
      }
    }

    if (status) {
      logger.info(getActivity(status.type), status.name)
      this.current = status
      this._bot.editStatus('online', status)
    }
  }

  /**
   * Start automatic status changing.
   */
  timerStart () {
    if (!this._timer) {
      this._timer = setInterval(() => this.setStatus(), this._interval)
    }
  }

  /**
   * Stop changing status automatically.
   */
  timerEnd () {
    if (this._timer) {
      this._timer = clearInterval(this._timer)
    }
  }

  async _randomStatus () {
    const statusQuery = this._dbm.newQuery('status')
    if (this.current) {
      statusQuery
        .notEqualTo('name', this.current.name)
        .notEqualTo('type', this.current.type)
    }
    const statuses = await statusQuery.find()
    if (statuses.length > 0) {
      this.timerStart()
      const dbStatus = statuses[Math.floor(Math.random() * statuses.length)]

      return {
        name: dbStatus.get('name'),
        type: dbStatus.get('type')
      }
    } else {
      this.timerEnd()
    }
  }
}

module.exports = StatusManager

/**
 * @typedef  {Object}  StatusManagerOptions
 * @property {String}  [mode='manual']      The mode of the StatusManager, either 'manual' or 'random'.
 * @property {Number}  [interval=43200000]  The amount of time to wait before randomly changing status (requires 'random' mode).
 */
