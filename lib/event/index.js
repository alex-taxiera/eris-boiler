/**
 * Class representing an event.
 */
class Event {
  /**
   * Create an Event.
   * @param {EventData} data The EventData.
   */
  constructor (data) {
    /**
     * @type {String} The event name.
     */
    this.name = data.name
    /**
     * @type {EventRunner} The function to run when the event occurs.
     */
    this.run = data.run
  }
}

/**
 * @typedef  {object}      EventData
 * @property {string}      name      The event name.
 * @property {EventRunner} run       The function to run when the event occurs.
 */

/**
 * @typedef {function(): void} EventRunner
 */

module.exports = Event
