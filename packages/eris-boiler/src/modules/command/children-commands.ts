import {
  Message,
  PrivateChannel,
  GuildTextableChannel
} from 'eris'

import {
  Client
} from '@modules/common'

import {
  Command,
  CommandOptions,
  CommandContext,
  CommandAction
} from './base-command'

export type PrivilegedCommandOptions = Omit<
  CommandOptions, 'dmOnly' | 'guildOnly'
>

export interface PrivateCommandContext extends CommandContext {
  message: Message<PrivateChannel>
}

export class PrivateCommand<
  T extends Client = Client,
  C extends PrivateCommandContext = PrivateCommandContext
> extends Command<T, C> {

  constructor (
    name: string,
    description: string,
    action: CommandAction<T, C>,
    options?: Partial<PrivilegedCommandOptions>
  ) {
    super(name, description, action, {
      ...options,
      dmOnly: true
    })
  }

}

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
    options?: Partial<PrivilegedCommandOptions>
  ) {
    super(name, description, action, {
      ...options,
      guildOnly: true
    })
  }

}
