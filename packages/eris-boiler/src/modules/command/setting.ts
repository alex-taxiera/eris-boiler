import {
  Client,
} from '@modules/client'

import {
  GuildCommand,
  GuildCommandContext,
} from '@modules/command/guild'

export class SettingCommand<
  T extends Client = Client,
  Y = unknown
> extends GuildCommand<T> {

  constructor (
    name: string,
    description: string,
    public readonly getValue: (
      bot: T,
      context: GuildCommandContext
    ) => Y | Promise<Y>,
    public readonly setValue: (
      bot: T,
      context: GuildCommandContext,
      value: Y
    ) => void | Promise<void>,
    public readonly displayName: string,
    public readonly setting: string,
  ) {
    super(name, description, () => '')
  }

}
