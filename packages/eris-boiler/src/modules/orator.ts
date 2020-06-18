import { Client } from '@modules/client'
import { Message } from 'eris'
import {
  Command,
} from './command/base'

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
    const regex = /"(.+?)"|[\S]+/g
  }

  private async parseParams (
    command: Command,
    content: string,
    regex: RegExp,
  ): Promise<{ [k: string]: unknown }> {
    return command.params.reduce(
      (prom, param) =>
        prom.then(
          async (ax) =>
            ({ ...ax, [param.name]: await param.resolve(regex.exec(content)) }),
        ),
      Promise.resolve({}),
    )
  }

}
