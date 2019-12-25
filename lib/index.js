module.exports = {
  ...require('./command'),
  DataClient: require('./data-client'),
  DatabaseManager: require('./database-manager'),
  DatabaseObject: require('./database-object'),
  DatabaseQuery: require('./database-query'),
  DiscordEvent: require('./discord-event'),
  Orator: require('./orator'),
  Permission: require('./permission'),
  RAMManager: require('./ram-manager'),
  SQLManager: require('./sql-manager'),
  StatusManager: require('./status-manager')
}
