import type { AnyInteractionGateway, Client } from 'oceanic.js'

import { CommandMiddleware as CoreCommandMiddleware } from '@hephaestus/core'

export interface CommandMiddleware<Return = unknown>
  extends CoreCommandMiddleware<Client, AnyInteractionGateway, Return> {}
