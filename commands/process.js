const { Command } = require('../lib')
const { admin: permission } = require('../permissions')

module.exports = new Command({
  name: 'process',
  description: 'Check process stats',
  options: {
    permission
  },
  run: async ({ bot }) => {
    const seconds = process.uptime()
    const uptime = getDuration(seconds)

    const memory = Math.round(
      (process.memoryUsage().heapUsed / 1024 / 1024) * 100
    ) / 100

    const inline = true
    const embed = {
      description: ':heartbeat: [**Bot Stats**](https://github.com/alex-taxiera/eris-boiler)',
      thumbnail: { url: bot.user.avatarURL },
      timestamp: require('dateformat')(Date.now(), 'isoDateTime'),
      color: 0x3498db,
      footer: {
        icon_url: bot.user.avatarURL,
        text: 'eris-boiler'
      },
      fields: [
        { name: 'uptime', value: uptime, inline },
        { name: 'mem', value: `${memory}MB`, inline },
        { name: 'guilds', value: bot.guilds.size, inline }
      ]
    }
    return { embed }
  }
})

function getDuration (seconds) {
  const times = [ 31557600, 86400, 3600, 60 ]
  return times.reduce((ax, dx, cx) => {
    const quotient = Math.floor(ax.seconds / dx)
    ax.seconds = Math.floor(ax.seconds % dx)
    let str = ''
    if (quotient > 0) {
      str += quotient
      if (str.length < 2 && cx > 0) {
        str = '0' + str
      }
    } else if (ax.time[0]) {
      str = '00'
    }
    if (str) {
      ax.time.push(str)
    }
    if (times.length - 1 === cx) {
      if (ax.seconds < 10) {
        ax.seconds = '0' + ax.seconds
      }
      ax.time.push('' + ax.seconds)
      return ax.time.join(':')
    }
    return ax
  }, { time: [], seconds })
}
