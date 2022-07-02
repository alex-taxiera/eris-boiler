import {
  MaybePromise,
  unknownHasKey,
} from '@hephaestus/utils'

import { LoadableMap } from '@modules/loadable'

import { CommandMiddleware } from './middleware'
import { Permission } from './permission'

export interface AutoCompleteOption<Client, Interaction> {
  autocompleteAction: (
    interaction: Interaction,
    client: Client,
  ) => MaybePromise<void>
}

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

    if (!unknownHasKey(loadable, 'name')) {
      return false
    }

    if (
      !unknownHasKey(loadable, 'action')
    ) {
      if (
        !unknownHasKey(loadable, 'options') ||
        !Array.isArray(loadable.options)
      ) {
        return false
      }

      return loadable.options.some((option) => {
        if (unknownHasKey(option, 'type')) {
          if (typeof option.type === 'number' && option.type <= 2) {
            return true
          }
        }

        return false
      })
    }

    return true
  }

}
