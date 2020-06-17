import {
  LoadMap,
} from '@eris-boiler/common'

import {
  Command,
} from '@modules/command/base'

import {
  Client,
} from '@modules/client'

export class CommandMap<C extends Client> extends LoadMap<Command<C>> {

  protected _load (loadableObject: Command<C>): void {
    this.set(loadableObject.name, loadableObject)
  }

  public search (key: string): Command<C> | undefined {
    return this.find(
      (command) => command.name.toLowerCase() === key.toLowerCase() ||
                   command.aliases.includes(key.toLowerCase()),
    )
  }

}
