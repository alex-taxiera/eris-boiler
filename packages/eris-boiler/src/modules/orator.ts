import { Client } from '@modules/client'
import { Message } from 'eris'
import {
  Command,
  MessageData,
} from './command/base'
import { logger } from '@eris-boiler/common'

export type PrefixGenerator = (id?: string) => string | Promise<string>

export class Orator {

  private readonly getPrefix: PrefixGenerator

  constructor (
    prefix: PrefixGenerator | string,
  ) {
    this.getPrefix = typeof prefix === 'string' ? (): string => prefix : prefix
  }

  public async processMessage (
    client: Client,
    message: Message,
  ): Promise<void> {
    const prefix = await this.getPrefix(message.guildID)
    if (message.content.slice(0, prefix.length) !== prefix) {
      return
    }

    const content = message.content.slice(prefix.length)
    const regex = /(".+?"|'.+?'|`.+?`)|[\S]+/g

    const command = this.parseCommand(client, content, regex)
    if (!command) {
      return
    }

    const params = await this.parseParams(command, content, regex)

    const result = await command.action(client, {
      message,
      params,
    })

    if (result != null) {
      this.createMessage(message, result)
        .catch(() => logger.error('Failed to send message'))
    }
  }

  private parseCommand (
    client: Client,
    content: string,
    regex: RegExp,
  ): Command | null {
    const match = regex.exec(content)
    return client.commands.get(match?.[0]) as unknown as Command || null
  }

  private parseParams (
    command: Command,
    content: string,
    regex: RegExp,
  ): Promise<{ [k: string]: unknown }> {
    const args = []
    for (let i = 0; i < command.params.length; i++) {
      const match = regex.exec(content)
      if (match === null) {
        // await param.onMissing()
        throw new Error('Missing param')
      }

      args.push(match[1]?.slice(1, -1) ?? match[0])
    }

    return this.resolveParams(args, command)
  }

  private async resolveParams (
    args: string[],
    command: Command,
  ): Promise<{ [k: string]: unknown }> {
    const params: { [k: string]: unknown } = {}

    for (const param of command.params) {
      const arg = await param.resolve(args.shift() as string)
      if (arg == null) {
        // await param.onFail()
        throw new Error('Param did not resolve correctly')
      }

      params[param.name] = arg
    }

    return params
  }

  private createMessage (
    message: Message,
    data: MessageData,
  ): Promise<Message> {
    return typeof data === 'string'
      ? message.channel.createMessage(data)
      : message.channel.createMessage({
        content: data.content,
        embed: data.embed,
      }, data.file)
  }

}
