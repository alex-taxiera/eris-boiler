import { EventListeners } from 'eris'

import { EventMap as CoreEventMap } from '@hephaestus/core'

export type Event = {
  [K in keyof EventListeners]: {
    name: K
    handler: (...args: EventListeners[K]) => void
  }
}[keyof EventListeners]

export class EventMap extends CoreEventMap<Event> {}
