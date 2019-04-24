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
  constructor (databaseManager, options = {}) {
    /**
     * @type {DatabaseManager} The DatabaseManager used to fetch statuses.
     */
    this._manager = databaseManager
    /**
     * @type {String} The mode of the StatusManager, either 'manual' or 'random'.
     */
    this._mode = options.mode || 'manual'
    /**
     * @type {Status} The current Status of the bot.
     */
    this.current = null
    /**
     * @type {Timeout} The timer for automatically switching statuses.
     */
    this._timer = null
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
          const statuses = await this._manager.query('status').find()
          if (statuses.length > 1) {
            let dbStatus
            do {
              dbStatus = statuses[Math.floor(Math.random() * statuses.length)]
            } while (equalStatuses(this.current, dbStatus.toJSON()))

            status = {
              name: dbStatus.get('name'),
              type: dbStatus.get('type')
            }
          } else {
            const [ only ] = statuses
            if (!equalStatuses(this.current, only.toJSON())) {
              status = {
                name: only.get('name'),
                type: only.get('type')
              }
            }

            if (this._timer) {
              this.timerEnd()
            }
          }
          break
        case 'manual':
        default: return
      }
    }

    if (status) {
      logger.log(`${getActivity(status.type)} ${status.name}`, 'cyan')
      this.current = status
      this.editStatus('online', status)
    }
  }

  /**
   * Start automatic status changing.
   */
  timerStart () {
    this._timer = setInterval(() => this.setStatus(), this._interval)
  }

  /**
   * Stop changing status automatically.
   */
  timerEnd () {
    if (this._timer) {
      this._timer = clearInterval(this._timer)
    }
  }
}

module.exports = StatusManager

/**
 * @typedef {import ('../utils/status').Status} Status
 */

/**
 * @typedef  {Object}  StatusManagerOptions
 * @property {String}  [mode='manual']      The mode of the StatusManager, either 'manual' or 'random'.
 */
