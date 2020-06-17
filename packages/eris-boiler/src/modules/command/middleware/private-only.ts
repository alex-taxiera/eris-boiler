import {
  isInDM,
} from '@eris-boiler/common'

import {
  CommandMiddleware,
} from './base'

export const privateOnly = new CommandMiddleware((client, context) => {
  if (!isInDM(context.message)) {
    throw Error('Sorry, this command can only be used in DMs!')
  }
})
