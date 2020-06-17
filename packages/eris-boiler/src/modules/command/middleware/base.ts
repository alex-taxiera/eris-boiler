import { Client } from '@modules/client'
import { CommandContext } from '@modules/command/base'

export type CommandMiddlewareAction<
  T extends Client, C extends CommandContext, R = void
> = (client: T, context: C) => Promise<R> | R

export class CommandMiddleware<
  T extends Client = Client,
  C extends CommandContext = CommandContext,
  R = void
> {

  constructor (
    public readonly run: CommandMiddlewareAction<T, C, R>,
  ) {}

}
