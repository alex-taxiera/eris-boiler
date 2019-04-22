/**
 * Class representing a Toggle.
 * @extends {Setting}
 */
class Toggle extends require('../setting') {
  /**
   * Set the value of the Toggle to true.
   * @return {String}         Confirmation message.
   */
  enable () {
    return this.setValue(true)
  }
  /**
   * Set the value of the Toggle to false.
   * @return {String}         Confirmation message.
   */
  disable () {
    return this.setValue(false)
  }
  /**
   * Get whether this toggle is enabled.
   * @return {Boolean} If the toggle is enabled.
   */
  get on () {
    return this.value === true
  }
  /**
   * Get whether this toggle is disabled.
   * @return {Boolean} If the toggle is disabled.
   */
  get off () {
    return this.value === false
  }
}

module.exports = Toggle
