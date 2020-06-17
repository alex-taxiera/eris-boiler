import {
  Message,
  GuildTextableChannel,
} from 'eris'

import {
  Client,
} from '@modules/client'

import {
  Command,
  CommandContext,
  CommandAction,
  CommandOptions,
} from '@modules/command/base'
import { guildOnly } from '@modules/command/middleware'

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
    options?: Partial<CommandOptions>,
  ) {
    super(name, description, action, {
      ...options,
      middleware: [ guildOnly ].concat(options?.middleware ?? []),
    })
  }

}
