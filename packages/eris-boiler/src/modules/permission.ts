import { Client } from '@modules/client'
import { CommandContext } from '@modules/command/base'
import {
  CommandMiddleware,
  CommandMiddlewareAction,
} from '@modules/command/middleware/base'

export interface PermissionOptions {
  reason?: string
}

export class Permission<
  T extends Client = Client,
  C extends CommandContext = CommandContext
> extends CommandMiddleware<T, C, boolean> implements PermissionOptions {

  /** OPTIONS **/
  public readonly reason: string

  constructor (
    public readonly level: number,
    run: CommandMiddlewareAction<T, C, boolean>,
    options?: PermissionOptions,
  ) {
    super(run)

    this.reason = options?.reason ?? ''
  }

}
