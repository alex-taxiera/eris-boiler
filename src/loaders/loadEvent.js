module.exports = (bot, eventFile) => {
  try {
    const eventName = eventFile.split('.')[0]
    const event = require(`../events/${eventFile}`)
    bot.on(eventName, event.bind(null, bot))
    delete require.cache[require.resolve(`../events/${eventFile}`)]
    // bot.logger.success(`Loaded ${eventName} Event`)
  } catch (e) {
    bot.logger.error(`Unable to load event ${eventFile}: ${e}`)
  }
}
