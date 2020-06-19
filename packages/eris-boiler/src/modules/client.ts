import {
  Client as ErisClient,
  ClientOptions as ErisOptions,
} from 'eris'

import {
  logger,
} from '@eris-boiler/common'

import {
  Orator,
} from '@modules/orator'
import { CommandMap } from './command'

export interface ClientManagers {
  orator?: Orator
}

export interface ClientOptions extends ClientManagers {
  erisOptions: ErisOptions
}

export class Client extends ErisClient implements ClientManagers {

  public readonly orator: Orator
  public ownerId?: string
  public custom: any = {}
  public commands = new CommandMap<this>()

  /**
   * @param token   Discord bot token
   * @param options Client options
   */
  constructor (token: string, options?: ClientOptions) {
    super(token, options?.erisOptions)

    this.orator = options?.orator ?? new Orator('eb!')

    this.on('ready', () => {
      logger.success('Logged in!')
      this.setOwner()
        .catch((error) => this.emit('error', error))
    })

    this.on('messageCreate', (message) => {
      this.orator.processMessage(this, message)
        .catch((error) => this.emit('error', error))
    })
  }

  private async setOwner (): Promise<void> {
    this.ownerId = (await this.getOAuthApplication()).owner.id
  }

}
