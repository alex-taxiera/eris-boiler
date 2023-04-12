import { Promisable } from 'type-fest'
import {
  CommandAnvil,
  Command,
  Event,
  EventAnvil,
  PermissionAnvil,
  Permission,
} from '../'

export abstract class Hephaestus {
  public abstract commands: CommandAnvil<Command<any, any, any>>

  public abstract events: EventAnvil<Event>

  public abstract permissions: PermissionAnvil<Permission<any, any, any>>

  public abstract connect(): Promisable<void>
}
