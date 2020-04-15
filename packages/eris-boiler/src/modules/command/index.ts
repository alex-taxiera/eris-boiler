import {
  EmbedOptions,
  MessageFile,
  Message
} from 'eris'

import {
  Client
} from '@modules/client'

export type MessageData = string | {
  content?: string
  embed?: EmbedOptions
  file?: MessageFile
}

export type CommandResults = MessageData | Promise<MessageData>

export interface CommandContext {
  params: string[] // TODO: Make this an object
  message: Message
}

export type CommandAction<T extends Client, C extends CommandContext> = (
  bot: T,
  context: C
) => CommandResults | Promise<CommandResults>

export class Command<T extends Client> {
  constructor (
    public readonly name: string,
    public readonly description: string
  ) {}
}
