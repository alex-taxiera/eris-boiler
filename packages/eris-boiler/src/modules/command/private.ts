import {
  Message,
  PrivateChannel,
} from 'eris'

import {
  Client,
} from '@modules/client'

import {
  Command,
  CommandOptions,
  CommandContext,
  CommandAction,
} from '@modules/command/base'
import { privateOnly } from '@modules/command/middleware'

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
    options?: Partial<CommandOptions>,
  ) {
    super(name, description, action, {
      ...options,
      middleware: [ privateOnly ].concat(options?.middleware ?? []),
    })
  }

}
