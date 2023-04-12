import { Anvil } from '@modules/loadable'

import { CommandMiddleware } from './middleware'

export interface Permission<Client, Interaction, OptionsMap>
  extends CommandMiddleware<Client, Interaction, OptionsMap, boolean> {
  level: number
  name: string
  reason?: string
}

export abstract class PermissionAnvil<
T extends Permission<any, any, any>,
> extends Anvil<T> {

  protected isValid (loadable: unknown): loadable is T {
    if (
      loadable == null ||
      typeof loadable !== 'object' ||
      !('name' in loadable) ||
      !('level' in loadable) ||
      !('action' in loadable)
    ) {
      return false
    }

    return true
  }

}
