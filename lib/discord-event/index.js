class DiscordEvent {
  /**
   * Class representing an event.
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
 * @callback DiscordEventRunner
 * @param    {DataClient} bot  The DataClient.
 * @param    {...any}     rest The rest.
 * @returns  {void}
 */
