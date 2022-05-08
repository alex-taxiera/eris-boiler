import { LoadableMap } from '@modules/loadable'

import { CommandMiddleware } from './middleware'

export interface Permission<Client, Interaction>
  extends CommandMiddleware<Client, Interaction, boolean> {
  level: number
  name: string
  reason?: string
}

export abstract class PermissionMap<
T extends Permission<any, any>,
> extends LoadableMap<T> {

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
