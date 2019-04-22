/**
 * Class representing a setting.
 * @extends {Setting}
 */
class SQLSetting extends require('../../setting') {
  constructor (databaseManager, guildId, name, value) {
    super({
      name
    })
    this._guildId = guildId
    this._databaseManager = databaseManager
    this._hasChanged = false
    this.value = value
  }

  /**
   * Sets the value of the setting.
   * @param  {*}       value The value to set.
   */
  setValue (val) {
    if (val !== this.value) {
      this.value = val
      this._hasChanged = true
    }
  }

  /**
   * Saves the Setting to the database.
   */
  async save () {
    if (!this._hasChanged) return
    await this._databaseManager.setSettings([this])
  }
}

module.exports = SQLSetting
