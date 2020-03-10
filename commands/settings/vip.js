const { SettingCommand } = require('../../lib')
const { owner: permission } = require('../../permissions')

module.exports = new SettingCommand({
  name: 'vip',
  description: 'set vip role for server',
  options: {
    parameters: [ 'vip role name/id/mention' ],
    permission
  },
  displayName: 'VIP Role',
  getValue: async (bot, { channel }) => {
    const dbGuild = await bot.dbm.newQuery('guild').get(channel.guild.id)
    const roleId = dbGuild.get('vip')

    if (!roleId) {
      return 'None'
    }

    return `<@&${roleId}>`
  },
  run: async (bot, { msg, params }) => {
    const [ roleId ] = params
    const fullParam = params.join(' ')

    const guild = msg.channel.guild
    const role = guild.roles.get(roleId) ||
      guild.roles.find((r) => r.name === fullParam)

    if (!role) {
      return `Could not find role "${fullParam}"`
    }

    const dbGuild = await bot.dbm.newQuery('guild').get(guild.id)
    if (role.id === dbGuild.get('vip')) {
      return 'VIP is already set to that role!'
    }

    await dbGuild.save({ vip: role.id })
    return 'VIP set!'
  }
})
