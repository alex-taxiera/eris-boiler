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
import { CommandParam } from './parameter'

export type MessageData = string | {
  content?: string
  embed?: EmbedOptions
  file?: MessageFile
}

export type CommandResults = MessageData | Promise<MessageData>

export interface CommandContext {
  params: { [k: string]: unknown } // TODO: Make this an array of object
  message: Message
}

export type CommandAction<
  T extends Client = Client,
  C extends CommandContext = CommandContext
> = (
  bot: T,
  context: C
) => CommandResults | Promise<CommandResults>

export interface CommandOptions {
  aliases: Array<string>
  params: CommandParam[]
  subCommands: Array<Command>
  permission?: Permission
  middleware: Array<CommandMiddleware>
}

export class Command<
  T extends Client = Client,
  C extends CommandContext = CommandContext
> extends Loadable implements CommandOptions {

  public readonly aliases: Array<string>
  public readonly params: CommandParam[]
  public readonly numberOfRequiredParams: number
  public readonly permission?: Permission
  public readonly middleware: Array<CommandMiddleware>
  public readonly subCommands: Array<Command>

  constructor (
    public readonly name: string,
    public readonly description: string,
    public readonly action: CommandAction<T, C>,
    options: Partial<CommandOptions> = {},
  ) {
    super()
    this.aliases = options.aliases ?? []
    this.params = options.params ?? []
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
