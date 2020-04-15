import {
  LoadMap
} from '@eris-boiler/common'

import {
  Command
} from '@modules/command'

import {
  Client
} from '@modules/client'

export class CommandMap<C extends Client> extends LoadMap<Command<C>> {
  protected _load (loadableObject: Command<C>): void {
    this.set(loadableObject.name, loadableObject)
  }
}
