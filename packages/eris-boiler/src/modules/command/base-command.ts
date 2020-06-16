import {
  EmbedOptions,
  MessageFile,
  Message,
  PrivateChannel,
  GuildTextableChannel
} from 'eris'

import {
  Client
} from '@modules/client'
import {
  Permission
} from '@modules/permission'
import {
  CommandMiddleware
} from './middleware'

export type MessageData = string | {
  content?: string
  embed?: EmbedOptions
  file?: MessageFile
}

export type CommandResults = MessageData | Promise<MessageData>

export interface CommandContext {
  params: string[] // TODO: Make this an array of object
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
  subCommands: Array<Command>
  permission?: Permission
  middleware: Array<CommandMiddleware>
  dmOnly: boolean
  guildOnly: boolean
}

export class Command<
  T extends Client = Client,
  C extends CommandContext = CommandContext
> implements CommandOptions {

  public readonly aliases: Array<string>
  public readonly dmOnly: boolean
  public readonly permission?: Permission
  public readonly middleware: Array<CommandMiddleware>
  public readonly guildOnly: boolean
  public readonly subCommands: Array<Command>

  constructor (
    public readonly name: string,
    public readonly description: string,
    public readonly action: CommandAction<T, C>,
    options?: Partial<CommandOptions>
  ) {
    this.aliases = options?.aliases ?? []
    this.subCommands = options?.subCommands ?? []
    this.permission = options?.permission
    this.middleware = options?.middleware ?? []
    this.dmOnly = options?.dmOnly ?? false
    this.guildOnly = options?.guildOnly ?? false
  }

}
