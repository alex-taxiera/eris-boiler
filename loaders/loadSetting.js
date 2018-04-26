module.exports = (bot, settingFile) => {
  const settingName = settingFile.split('.')[0]
  bot.settings.set(settingName, require(`../settings/${settingFile}`)(bot))
  bot.logger.success(`Loaded ${bot.settings.get(settingName).name} Setting`)
}
