import { EventListeners } from 'eris'

import { EventAnvil as CoreEventAnvil } from '@hephaestus/core'

export type Event = {
  [K in keyof EventListeners]: {
    name: K
    handler: (...args: EventListeners[K]) => void
  }
}[keyof EventListeners]

export class EventAnvil extends CoreEventAnvil<Event> {}
