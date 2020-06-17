import {
  Message,
  PrivateChannel,
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
    options?: Partial<PrivilegedCommandOptions>,
  ) {
    super(name, description, action, {
      ...options,
      dmOnly: true,
    })
  }

}
