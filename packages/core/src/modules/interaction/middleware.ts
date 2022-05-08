import { MaybePromise } from '@hephaestus/utils'

type CommandMiddlewareAction<
Client, Interaction, Return = unknown,
> = (interaction: Interaction, client: Client) => MaybePromise<Return>

export interface CommandMiddleware<
Client, Interaction, Return = unknown,
> {
  action: CommandMiddlewareAction<Client, Interaction, Return>
}
