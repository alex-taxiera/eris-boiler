import {
  Message,
  GuildTextableChannel,
} from 'eris'

import {
  Client,
} from '@modules/client'

import {
  Command,
  PrivilegedCommandOptions,
  CommandContext,
  CommandAction,
} from '@modules/command/base'

export interface GuildCommandContext extends CommandContext {
  message: Message<GuildTextableChannel>
}

export class GuildCommand<
  T extends Client = Client,
  C extends GuildCommandContext = GuildCommandContext
> extends Command<T, C> {

  constructor (
    name: string,
    description: string,
    action: CommandAction<T, C>,
    options?: Partial<PrivilegedCommandOptions>,
  ) {
    super(name, description, action, {
      ...options,
      guildOnly: true,
    })
  }

}
