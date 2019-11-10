/**
 * Class representing an event.
 * <T extends DataClient>
 */
class DiscordEvent {
  /**
   * Create an Event.
   * @param {DiscordEventData<T>} data The EventData.
   */
  constructor (data) {
    /**
     * @type {String}
     */
    this.name = data.name
    /**
     * @type {DiscordEventRunner<T>}
     */
    this.run = data.run
  }
}

module.exports = DiscordEvent

/**
 * @typedef  DiscordEventData<T extends DataClient>
 * @property {string}             name      The event name.
 * @property {DiscordEventRunner} run       The function to run when the event occurs.
 */

/**
 * @callback DiscordEventRunner<T>
 * @param    {T}      bot  The DataClient.
 * @param    {...any} rest The rest.
 * @returns  {void}
 */
