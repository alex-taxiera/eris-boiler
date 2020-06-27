import {
  ClientEvents,
  ShardEvents,
} from 'eris'
import { Loadable } from '@eris-boiler/common'

export class ErisEvent extends Loadable {

  constructor (
    public readonly event: string,
    public readonly listener: (...args: any[]) => void,
  ) {
    super()
  }

}

export const ClientEvent: ClientEvents<ErisEvent> = (
  event: string,
  listener: (...args: any[]) => void,
) => new ErisEvent(event, listener)

export const ShardEvent: ShardEvents<ErisEvent> = (
  event: string,
  listener: (...args: any[]) => void,
) => new ErisEvent(event, listener)
