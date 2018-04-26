/**
 * Class representing a Toggle.
 * @extends {Setting}
 * @prop    {Boolean} value The value of the Toggle.
 */
class Toggle extends require('./Setting.js') {
  /**
   * Set the value of the Toggle to true.
   * @param  {Client} bot   The bot object.
   * @return {String}       Confirmation message.
   */
  enable (bot) {
    return this.setValue(true, bot)
  }
  /**
   * Set the value of the Toggle to false.
   * @param  {Client} bot   The bot object.
   * @return {String}       Confirmation message.
   */
  disable (bot) {
    return this.setValue(false, bot)
  }
}

module.exports = Toggle
