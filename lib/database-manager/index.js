/**
 * Class representing a database manager.
 */
class DatabaseManager {
  /**
   * Insert a guild into the guild_settings table.
   * @param  {String}            id     The ID of the guild.
   * @param  {String}            prefix The default prefix
   * @return {Promise<Object[]>}        Returns the updated table.
   */
  async addClient (id, prefix) {
    throw Error('Not yet implemented!')
  }

  /**
   * Insert a status into the statuses table.
   * @param  {String}            name   The name of the status.
   * @param  {Number}            [type] The type of the status.
   * @param  {Boolean}           [def]  Whether or not this is the default status.
   * @return {Promise<Object[]>}        Returns the updated table.
   */
  addStatus (status, def) {
    throw Error('Not yet implemented!')
  }
  /**
   * Returns the default presence of the bot.
   * @returns {Status}
   */
  getDefaultStatus () {
    throw Error('Not yet implemented!')
  }
  /**
   * Get data on a guild from the guild_settings table
   * @param  {String}       guildId The ID of the guild.
   * @param  {String}       name    The (camelCase) name of the setting.
   * @return {GuildSetting}         The guild setting.
   */
  getSetting (guildId, name) {
    throw Error('Not yet implemented!')
  }
  /**
   * Get data on a guild from the guild_settings table
   * @param  {String} id The ID of the guild.
   * @return {Object}    The guild data.
   */
  getSettings (id) {
    throw Error('Not yet implemented!')
  }
  /**
   * Get the statuses of the bot from the statuses table.
   * @return {Status[]} Array of statuses, name and type.
   */
  getStatuses () {
    throw Error('Not yet implemented!')
  }
  /**
   * Get data on a guild from the guild_toggles table
   * @param  {String} id The ID of the guild.
   * @return {Object}    The guild data.
   */
  getToggles (id) {
    throw Error('Not yet implemented!')
  }
  /**
   * Check saved guild data against live guild data.
   * @param {Collection<Guild>} guilds The bots collection of guilds at start up.
   */
  async initialize (guilds, defaultPrefix) {
    throw Error('Not yet implemented!')
  }

  /**
   * Remove a guild from the guild_settings table.
   * @param  {String}            id The guild ID to remove.
   * @return {Promise<Object[]>}    Returns the updated table.
   */
  removeClient (id) {
    throw Error('Not yet implemented!')
  }

  /**
   * Remove a status from the statuses table.
   * @param  {String}            name The status to remove.
   * @return {Promise<Object[]>}      Returns the updated table.
   */
  removeStatus (name) {
    throw Error('Not yet implemented!')
  }

  /**
   * Set data on a guild from the guild_settings table
   * @param {Setting[]} settings The settings to update.
   */
  setSettings (settings) {
    throw Error('Not yet implemented!')
  }

  /**
   * Update the default status of the bot.
   * @param  {Status}            status The status to update to.
   * @return {Promise<Object[]>}        Returns the updated table.
   */
  updateDefaultStatus (status) {
    throw Error('Not yet implemented!')
  }

  /**
   * Update a guild entry in the guild_settings table.
   * @param  {String}            id       The ID of the guild.
   * @param  {Object}            settings The data to update. Property names should match column names.
   * @return {Promise<Object[]>}          Returns the updated table.
   */
  updateSettings (id, settings) {
    throw Error('Not yet implemented!')
  }

  /**
   * Update a guild entry in the guild_toggles table.
   * @param  {String}            id      The ID of the guild.
   * @param  {Object}            toggles The data to update. Property names should match column names.
   * @return {Promise<Object[]>}         Returns the updated table.
   */
  updateToggles (id, toggles) {
    throw Error('Not yet implemented!')
  }

  /**
   * Create database tables.
   * @private
   * @param   {Object[]}        config The DB schema.
   * @return  {Promise<Object>}        The results of the table creation.
   */
  async _createTables (tables) {
    throw Error('Not yet implemented!')
  }
}

module.exports = DatabaseManager
