module.exports.findOrCreateManagedWebhook = async (channel, userId, name) => {
  if (channel.guild) {
    const hooks = await channel.getWebhooks()
    const existing = hooks
      .find((hook) => hook.user.id === userId && (!name || hook.name === name))

    return existing || channel.createWebhook({ name })
  }
}
