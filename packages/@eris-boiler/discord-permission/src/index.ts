import {
  checkChannelPermissions,
  isInGuild,
  PermissionKeys,
} from '@eris-boiler/common'
import {
  CommandMiddleware,
} from 'eris-boiler'

export function discordPermission (
  permissions: PermissionKeys,
): CommandMiddleware {
  return new CommandMiddleware((_, context) => {
    if (!isInGuild(context.message.channel)) {
      throw Error('Sorry, this command can only be used in a Discord Server!')
    }

    if (
      !checkChannelPermissions(
        context.message.author.id,
        context.message.channel,
        permissions,
      )
    ) {
      throw Error(
        `You do not have the required permissions for this command! [${
          permissions.join(' ')
        }]`,
      )
    }
  })
}
