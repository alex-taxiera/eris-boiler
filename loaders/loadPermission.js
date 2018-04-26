module.exports = (bot, permissionFile) => {
  const permission = require(`../permissions/${permissionFile}`)
  bot.permissions.set(permission.name, permission)
  bot.logger.success(`Loaded ${bot.permissions.get(permission.name).name} Permission Level`)
}
