import { Client } from '@modules/client'
import { Message } from 'eris'
import {
  Command,
  CommandContext,
} from './command/base'

export type PrefixGenerator = (id?: string) => string | Promise<string>

export class Orator {

  private readonly getPrefix: PrefixGenerator

  constructor(
    prefix: PrefixGenerator | string,
  ) {
    this.getPrefix = typeof prefix === 'string' ? (): string => prefix : prefix
  }

  public async processMessage(
    client: Client,
    message: Message,
  ): Promise<void> {
    const prefix = await this.getPrefix(message.guildID)
    if (message.content.slice(0, prefix.length) !== prefix) {
      return
    }

    const content = message.content.slice(prefix.length)
    const regex = /"(.+?)"|[\S]+/g

    const command = this.parseForCommand(client, content, regex)
    if (!command) {
      return
    }

    let params = {}
    if (command.params) {
      params = await this.parseParams(command, content, regex)
    }
    const context: CommandContext = {
      client,
      params,
      message,
    }
    
    const commandResult = await command.run(context)
    if (commandResult) {
      message.channel.createMessage(commandResult, commandResult.file)
    }
  }

  private parseForCommand (
    client: Client,
    content: string,
    regex: RegExp,
  ): Command | undefined {
    const match = regex.exec(content)
    return client.commands.get(match[0])
  }

  private async parseParams (
    command: Command,
    content: string,
    regex: RegExp,
  ): any {
    const args = {}
    for (const param of command.params) {
      await this.checkParam(args, param, regex.exec(content))
    }
    return args
  }

  private async checkParam (
    args,
    param,
    match,
  ): any {
    if (match == null) {
      throw new Error('missing arg')
    }

    const input = match[1] ?? match[0]
    const arg = await param.resolve(input)
    if (arg == null) {
      throw new Error('argument did not resolve correctly')
    }

    args[param.name] = arg
  }
}
