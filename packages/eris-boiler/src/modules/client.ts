import {
  Client as ErisClient,
  ClientOptions as ErisOptions
} from 'eris'

import {
  logger
} from '@eris-boiler/common'

import {
  Orator
} from '@modules/orator'

export class Client extends ErisClient {
  private readonly ora: Orator = new Orator()
  public ownerId?: string
  public custom: any = {}

  /**
   * @param token   Discord bot token
   * @param options Client options
   */
  constructor (token: string, options: { erisOptions: ErisOptions }) {
    super(token, options.erisOptions)

    this.on('ready', () => {
      logger.success('Logged in!')
    })
  }

  private async setOwner (): Promise<void> {
    this.ownerId = (await this.getOAuthApplication()).owner.id
  }
}
