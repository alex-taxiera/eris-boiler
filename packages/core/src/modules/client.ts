import { MaybePromise } from '@hephaestus/utils'
import {
  CommandMap,
  Command,
  Event,
  EventMap,
  PermissionMap,
  Permission,
} from '../'

export abstract class Forge {

  public abstract commands: CommandMap<Command<any, any>>

  public abstract events: EventMap<Event>

  public abstract permissions: PermissionMap<Permission<any, any>>

  public abstract connect (): MaybePromise<void>

}
