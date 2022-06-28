import { MaybePromise } from '@hephaestus/utils'

import { LoadableMap } from '@modules/loadable'

import { CommandMiddleware } from './middleware'
import { Permission } from './permission'

export interface Command<Client, Interaction> {
  name: string
  permission?: Permission<Client, Interaction>
  middleware?: Array<CommandMiddleware<Client, Interaction>>
  guildId?: string
}

export interface ExecutableCommand<Client, Interaction>
  extends Command<Client, Interaction> {
  action: (interaction: Interaction, client: Client) => MaybePromise<void>
}

export abstract class CommandMap<
T extends Command<any, any>,
> extends LoadableMap<T> {

  protected isValid (loadable: unknown): loadable is T {
    if (loadable == null || typeof loadable !== 'object') {
      return false
    }

    if (!('name' in loadable)) {
      return false
    }

    if (
      !('action' in loadable) &&
      (!('subCommands' in loadable) || !('subCommandGroups' in loadable))
    ) {
      return false
    }

    return true
  }

}