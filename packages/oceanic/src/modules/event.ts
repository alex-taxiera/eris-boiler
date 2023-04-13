import type { ClientEvents } from 'oceanic.js'

import { EventAnvil as CoreEventAnvil } from '@hephaestus/core'

export type Event = {
  [K in keyof ClientEvents]: {
    name: K
    handler: (...args: ClientEvents[K]) => void
  }
}[keyof ClientEvents]

export class EventAnvil extends CoreEventAnvil<Event> {}
