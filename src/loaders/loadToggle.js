module.exports = (bot, toggleFile) => {
  try {
    const toggleName = toggleFile.split('.')[0]
    bot.toggles.set(toggleName, require(`../toggles/${toggleFile}`)(bot))
    // bot.logger.success(`Loaded ${bot.toggles.get(toggleName).name} Setting`)
  } catch (e) {
    bot.logger.error(`Unable to load toggle ${toggleFile}: ${e}`)
  }
}
