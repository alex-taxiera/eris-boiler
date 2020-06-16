import { Client } from '@modules/client'
import { CommandContext } from '@modules/command'

export type CommandMiddlewareAction<
  T extends Client, C extends CommandContext, R = unknown
> = (client: T, context: C) => Promise<R> | R

export class CommandMiddleware<
  T extends Client = Client,
  C extends CommandContext = CommandContext,
  R = unknown
> {
  constructor (
    public readonly run: CommandMiddlewareAction<T, C, R>
  ) {}
}
