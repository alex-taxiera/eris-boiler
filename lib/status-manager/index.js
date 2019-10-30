const {
  status: {
    isValidType,
    getActivity,
    equalStatuses
  },
  logger
} = require('../utils')

class StatusManager {
  /**
   * A class representing a StatusManager.
   * @param {DataClient}           bot             The DataClient to manage.
   * @param {DatabaseManager}      databaseManager The DatabaseManager used to fetch statuses.
   * @param {StatusManagerOptions} [options={}]    StatusManagerOptions.
   */
  constructor (bot, databaseManager, {
    mode = 'manual',
    interval = 43200000,
    defaultStatus
  } = {}) {
    /**
     * @type    {DataClient}
     * @private
     */
    this._bot = bot
    /**
     * @type    {DatabaseManager}
     * @private
     */
    this._dbm = databaseManager
    /**
     * @type    {string}
     * @private
     */
    this._mode = mode
    /**
     * @type    {number}
     * @private
     */
    this._interval = interval
    /**
     * @type {Status}
     */
    this.defaultStatus = defaultStatus
    /**
     * @type {Status}
     */
    this.current = null
    /**
     * @type    {Timeout}
     * @private
     */
    this._timer = null
  }

  /**
   * Initialize the statuses.
   * @returns {Promise<void>}
   */
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

  /**
   * Get the statuses for this bot.
   * @returns {Promise<Array<DatabaseObject>>} The search results.
   */
  getStatuses () {
    return this._dbm.newQuery('status').find()
  }

  /**
   * Search for statuses by name.
   * @param   {string}                         name The name to search by.
   * @returns {Promise<Array<DatabaseObject>>}      The search results.
   */
  findStatusByName (name) {
    return this._dbm.newQuery('status').equalTo('name', name).find()
  }

  /**
   * Add a status record.
   * @param   {Status}        status The status to add.
   * @returns {Promise<void>}
   */
  async addStatus (status) {
    const [
      oldStatuses,
      dbStatus
    ] = await Promise.all([
      this.getStatuses(), this._dbm.add('status', status)
    ])

    if (oldStatuses.length === 0) {
      this.setStatus(dbStatus.toJSON())
    } else if (
      oldStatuses.length === 1 && !this._timer && this._mode === 'random'
    ) {
      this.timerStart()
    }
  }

  /**
   * Delete a status record.
   * @param   {DatabaseObject} dbStatus The status to delete (as a DatabaseObject).
   * @returns {Promise<void>}
   */
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
   * @param   {Status}        [status] Status to set to, if none is given and mode is random, it will randomly change.
   * @returns {Promise<void>}
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
   * @returns {void}
   */
  timerStart () {
    if (!this._timer) {
      this._timer = setInterval(() => this.setStatus(), this._interval)
    }
  }

  /**
   * Stop changing status automatically.
   * @returns {void}
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
 * @typedef  StatusManagerOptions
 * @property {string} [mode='manual']      The mode of the StatusManager, either 'manual' or 'random'.
 * @property {number} [interval=43200000]  The amount of time to wait before randomly changing status (requires 'random' mode).
 * @property {Status} defaultStatus        The default status of the bot.
 */
