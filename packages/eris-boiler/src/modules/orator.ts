import { Client } from '@modules/client'
import {
  Message,
  MessageContent,
  MessageFile,
} from 'eris'
import {
  Command,
} from './command/base'
import {
  isInDM,
  createDirectMessage,
  createMessage,
} from '@eris-boiler/common'

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
        ([ match, group ]) => (group?.slice(1, -1) ?? match),
      )
  }

  public async processMessage (
    client: Client,
    message: Message,
  ): Promise<any> {
    if (!message.content && message.author.bot) {
      return
    }

    const [ commandName, ...args ] = await this.cleanParams(
      client,
      message,
    )

    const command = client.commands.search(commandName)
    if (!command) {
      return
    }

    // if (command.numberOfRequiredParams > args.length) {
    //   return this.replyToMessage(client, message, 'Not enough params!')
    // }

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
  ): Promise<Array<string>> {
    const args = this.separatePositionalArgs(this.cleanContent(message.content))
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
  ): Promise<Record<string, unknown>> {
    const resolved: Record<string, unknown> = {}

    for (let i = 0; i < command.params.length; i++) {
      const param = command.params[i]
      const arg = args[i]
      if (arg) {
        resolved[param.name] = await param.resolve(args[i])

        if (param.required && resolved[param.name] === undefined) {
          throw Error('hmmm')
        }
      } else if (param.required) {
        throw Error('shit')
      }
    }

    return resolved
  }

  private replyToMessage (
    client: Client,
    message: Message,
    content: MessageContent,
    file?: MessageFile,
  ) {
    return isInDM(message.channel)
      ? createDirectMessage(client.user, message.author, content, { file })
      : createMessage(client.user, message.channel, content, file)
  }

}
