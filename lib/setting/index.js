/**
 * Class representing a setting.
 * @extends {SafeClass}
 */
class Setting extends require('../safe-class') {
  /**
   * Create a setting.
   * @param {Object}     data            An object with data to assign to the Setting.
   * @param {String}     data.name       The (camelCase) name of the setting.
   */
  constructor (data) {
    const mandatoryTypes = {
      name: 'string'
    }
    super(mandatoryTypes)
    const {
      name
    } = data
    /**
     * The (camelCase) name of the setting.
     * @type {String}
     */
    this.name = name
    /**
     * The value of the setting.
     * Default values are applied in DataClient constructor.
     * @type {*}
     */
    this.value = undefined

    this._checkDataTypes()
  }

  get properName () {
    let properName = this.name.charAt(0).toUpperCase()

    for (let i = 1; i < this.name.length; i++) {
      const ascii = this.name.charCodeAt(i)
      if (ascii > 100 && ascii < 133) {
        properName += ' '
      }
      properName += this.name.charAt(i)
    }

    return properName
  }

  /**
   * Sets the value of the setting.
   * @param  {*}          value The value to set.
   * @return {String}           Confirmation message.
   */
  setValue (value) {
    if (this.value === value) return `${this.name} is already ${this.value}!`
    this.value = value

    return `${this.name} set to ${this.value}!`
  }
}

module.exports = Setting
