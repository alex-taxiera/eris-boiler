module.exports = (bot, settingFile) => {
  try {
    const settingName = settingFile.split('.')[0]
    bot.settings.set(settingName, require(`../settings/${settingFile}`)(bot))
    // bot.logger.success(`Loaded ${bot.settings.get(settingName).name} Setting`)
  } catch (e) {
    bot.logger.error(`Unable to load setting ${settingFile}: ${e}`)
  }
}
