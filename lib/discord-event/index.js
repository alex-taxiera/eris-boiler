/**
 * Class representing an event.
 */
class DiscordEvent {
  /**
   * Create an Event.
   * @param {DiscordEventData} data The EventData.
   */
  constructor (data) {
    /**
     * @type {String}
     */
    this.name = data.name
    /**
     * @type {DiscordEventRunner}
     */
    this.run = data.run
  }
}

module.exports = DiscordEvent

/**
 * @typedef  DiscordEventData
 * @property {string}             name      The event name.
 * @property {DiscordEventRunner} run       The function to run when the event occurs.
 */

/**
 * @typedef {Function(DataClient, ...any[]): void} DiscordEventRunner
 */
