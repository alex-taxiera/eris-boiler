module.exports = (bot, permissionFile) => {
  try {
    const permission = require(`../permissions/${permissionFile}`)
    bot.permissions.set(permission.name, permission)
    // bot.logger.success(`Loaded ${bot.permissions.get(permission.name).name} Permission Level`)
  } catch (e) {
    bot.logger.error(`Unable to load permission ${permissionFile}: ${e}`)
  }
}
