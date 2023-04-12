import { Promisable } from 'type-fest'

type CommandMiddlewareAction<
Client, Interaction, OptionsMap, Return = unknown,
> = (
  interaction: Interaction,
  data: OptionsMap, client: Client) => Promisable<Return>

export interface CommandMiddleware<
Client, Interaction, OptionsMap, Return = unknown,
> {
  action: CommandMiddlewareAction<Client, Interaction, OptionsMap, Return>
}
