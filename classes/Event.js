/**
 * Class representing an event.
 * @extends {SafeClass}
 */
class Event extends require('./SafeClass.js') {
  constructor (data) {
    super({
      name: 'string',
      run: 'function'
    })
    /**
     * The event name.
     * @type {String}
     */
    this.name = data.name
    /**
     * The function to run when the event occurs.
     * @type {Function}
     */
    this.run = data.run

    // verify types of properties match those defined in mandatoryTypes
    this._checkDataTypes()
  }
}

module.exports = Event
