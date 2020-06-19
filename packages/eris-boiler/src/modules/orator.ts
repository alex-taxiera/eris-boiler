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

  private cleanContent (content: string): string {
    return content
      .replace(/[\uFE00-\uFE0F]/g, '')
      .replace(/<[@|#][&|!]?([0-9]+)>/g, (match, capture) => capture as string)
  }

  private separatePositionalArgs (content: string): Array<string> {
    return [ ...content.matchAll(/(".+?"|'.+?'|`.+?`)|[\S]+/g) ]
      .map(
        ([ match, group ]) => (group ? group.slice(1, -1) : match),
      )
  }

  public async processMessage (
    client: Client,
    message: Message,
  ): Promise<void> {
    if (!message.content && message.author.bot) {
      return
    }

    const [ commandName, ...args ] = await this.cleanParams(
      client,
      message,
      message.content,
    )

    const command = client.commands.search(commandName)
    if (!command) {
      return
    }

    const params = await this.resolveParams(command, args)
    /**
     * TODO
     * -------------------------- refer to try to execute for below
     * check command permission
     * run command middleware
     * check for sub commands (recurse on sub commands)
     * -------------------------- refer to process command response for below
     * handle sending message
     * delete message if needed
     * call post hook
     */
  }

  private async cleanParams (
    client: Client,
    message: Message,
    content: string,
  ): Promise<Array<string>> {
    const args = this.separatePositionalArgs(this.cleanContent(content))
    const first = args.shift()
    let commandName: string | undefined

    if (first === client.user.id && args.length > 0) {
      commandName = args.shift()
    } else if (first?.startsWith(client.user.id)) {
      commandName = first.substring(client.user.id.length)
    }

    if (!commandName) {
      if (first === client.user.id) {
        commandName = 'help'
      } else {
        const prefix = await this.getPrefix(message.guildID)
        if (first === prefix) {
          commandName = args.shift()
        } else if (first?.startsWith(prefix)) {
          commandName = first.substring(prefix.length)
        }
      }
    }

    return [ commandName ?? '', ...args ]
  }

  private async resolveParams (
    command: Command,
    args: Array<string>,
  ): Promise<{ [k: string]: unknown }> {
    if (command.params.length !== args.length) {
      throw Error('not enough parameters')
    }

    const params = await command.params
      .reduce<Promise<{ [k: string]: unknown }>>(
        async (prom, commandParam, i) => prom.then(async (resolved) => {
          const res = await commandParam.resolve(args[i])
          if (res === undefined) {
            throw Error('shit')
          }
          resolved[commandParam.name] = res
          return resolved
        }), Promise.resolve({}),
      )

    return params
  }

}
