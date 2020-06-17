import {
  isInGuild,
} from '@eris-boiler/common'

import {
  CommandMiddleware,
} from './base'

export const guildOnly = new CommandMiddleware((client, context) => {
  if (!isInGuild(context.message)) {
    throw Error('Sorry, this command can only be used in a Discord Server!')
  }
})
