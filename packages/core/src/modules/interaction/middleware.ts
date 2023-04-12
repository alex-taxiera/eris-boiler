import { Promisable } from 'type-fest'

type CommandMiddlewareAction<Client, Interaction, Return = unknown> = (
  interaction: Interaction,
  client: Client
) => Promisable<Return>

export interface CommandMiddleware<Client, Interaction, Return = unknown> {
  action: CommandMiddlewareAction<Client, Interaction, Return>
}
