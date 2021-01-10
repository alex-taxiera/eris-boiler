import {
  EmbedOptions,
  MessageFile,
  Message,
} from 'eris'

import {
  Client,
} from '@modules/client'
import {
  Permission,
} from '@modules/permission'
import {
  CommandMiddleware,
} from '@modules/command/middleware/base'
import { Loadable } from '@eris-boiler/common'
import {
  booleanResolver,
  CommandParam,
  floatResolver,
  ActualArgs,
} from './parameter'

export type MessageData = string | {
  content?: string
  embed?: EmbedOptions
  file?: MessageFile
}

export type CommandResults = MessageData | Promise<MessageData>

export interface CommandContext<T extends readonly CommandParam[]> {
  params: ActualArgs<T>
  message: Message
}

export type CommandAction<
  T extends readonly CommandParam[],
  C extends Client = Client,
> = (
  bot: C,
  context: CommandContext<T>
) => CommandResults | Promise<CommandResults>

export interface CommandOptions<T extends readonly CommandParam[]> {
  aliases: Array<string>
  params: readonly [...T]
  // eslint-disable-next-line no-use-before-define
  subCommands: Array<Command<T>>
  permission?: Permission
  middleware: Array<CommandMiddleware>
}

export class Command<
  T extends readonly CommandParam[],
  C extends Client = Client,
> extends Loadable implements CommandOptions<T> {

  public readonly aliases: Array<string>
  public readonly params: readonly [...T]
  public readonly numberOfRequiredParams: number
  public readonly permission?: Permission
  public readonly middleware: Array<CommandMiddleware>
  public readonly subCommands: Array<Command<any>>

  constructor (
    public readonly name: string,
    public readonly description: string,
    public readonly action: CommandAction<T, C>,
    options: Partial<CommandOptions<T>> = {},
  ) {
    super()
    this.aliases = options.aliases ?? []
    this.params = (options.params ?? []) as unknown as readonly [...T]
    this.numberOfRequiredParams = this.params.filter(
      (param) => param.required,
    ).length
    this.subCommands = options.subCommands ?? []
    this.permission = options.permission
    this.middleware = options.middleware ?? []

    let flag = false
    for (const param of this.params) {
      if (param.required === false) {
        flag = true
      } else if (flag === true) {
        throw Error(
          `Found required param after optional param in command "${this.name}"`,
        )
      }
    }
  }

}
