import {
  Client as ErisClient,
  ClientOptions as ErisOptions
} from 'eris'

import {
  logger
} from '@eris-boiler/utils'

import {
  Orator
} from '@modules/orator'

export class Client extends ErisClient {
  private readonly ora: Orator = new Orator()

  constructor (token: string, options: { erisOptions: ErisOptions }) {
    super(token, options.erisOptions)

    this.on('ready', () => {
      logger.success('Logged in!')
    })
  }
}
