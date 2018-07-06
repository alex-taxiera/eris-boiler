/**
 * Class representing a setting.
 * @extends {SafeClass}
 */
class Setting extends require('./SafeClass.js') {
  /**
   * Create a setting.
   * @param {Object}     data            An object with data to assign to the Setting.
   * @param {String}     data.name       The (camelCase) name of the setting.
   * @param {String}     data.prettyName Pretty print name for setting.
   * @param {Function}   data._onChange   A function that gets executed whenever the value of the setting is changed.
   */
  constructor (data) {
    const mandatoryTypes = {
      name: 'string',
      prettyName: 'string',
      _onChange: 'function'
    }
    super(mandatoryTypes)
    const {
      name,
      prettyName,
      _onChange
    } = data
    /**
     * The name of the setting.
     * @type {String}
     */
    this.name = name
    /**
     * The (camelCase) code of the setting.
     * @type {String}
     */
    this.prettyName = prettyName
    /**
     * A function that gets executed whenever the value of the setting is changed.
     * @type {Function}
     */
    this._onChange = _onChange
    /**
     * The value of the setting.
     * Default values are applied in DataClient constructor.
     * @type {*}
     */
    this.value = undefined

    this._checkDataTypes()
  }
  /**
   * Sets the value of the setting.
   * @param  {*}          value The value to set.
   * @param  {DataClient} bot   The bot object.
   * @return {String}           Confirmation message.
   */
  setValue (value, bot) {
    if (this.value === value) return `${this.name} is already ${this.value}!`
    this.value = bot.config.DEFAULT[this.code] = value

    const { writeFile } = require('fs').promises
    writeFile('./config.json', JSON.stringify(bot.config, undefined, 2))
      .then((success) => bot.logger.success('wrote to config'))
      .catch(bot.logger.error)

    this._onChange(bot, value)
    return `${this.name} set to ${this.value}!`
  }
}

module.exports = Setting
