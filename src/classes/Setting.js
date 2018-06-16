const { writeFile } = require('fs').promises
/**
 * Class representing a setting.
 */
class Setting {
  /**
   * Create a setting.
   * @param {DataClient} bot           The bot object.
   * @param {Object}     data          An object with data to assign to the Setting.
   * @param {String}     data.name     The name of the Setting.
   * @param {String}     data.code     The (camelCase) code of the setting.
   * @param {Function}   data.onChange A function that gets executed whenever the value of the setting is changed.
   */
  constructor (bot, data) {
    const { name, code, onChange } = data
    if (typeof name !== 'string') throw new Error(`setting cannot have name ${name}`)
    if (typeof code !== 'string') throw new Error(`setting cannot have code ${code}`)
    if (typeof onChange !== 'function') throw new Error(`setting cannot have onChange function ${onChange}`)
    /**
     * The name of the setting.
     * @type {String}
     */
    this.name = name
    /**
     * The (camelCase) code of the setting.
     * @type {String}
     */
    this.code = code
    /**
     * A function that gets executed whenever the value of the setting is changed.
     * @type {Function}
     */
    this.onChange = onChange
    /**
     * The value of the setting.
     * @type {*}
     */
    this.value = bot.config.DEFAULT[this.code]
  }
  /**
   * Sets the value of the setting.
   * @param  {*}      value The value to set.
   * @param  {DataClient} bot   The bot object.
   * @return {String}       Confirmation message.
   */
  setValue (value, bot) {
    if (this.value === value) return `${this.name} is already ${this.value}!`
    this.value = bot.config.DEFAULT[this.code] = value

    writeFile('./config.json', JSON.stringify(bot.config, undefined, 2))
      .then((success) => bot.logger.success('wrote to config'))
      .catch(bot.logger.error)

    this.onChange(bot, value)
    return `${this.name} set to ${this.value}!`
  }
}

module.exports = Setting
