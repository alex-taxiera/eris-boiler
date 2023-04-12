import {
  Client,
  CommandInteraction,
} from 'eris'

import { CommandMiddleware as CoreCommandMiddleware } from '@hephaestus/core'

export interface CommandMiddleware<O = unknown, Return = unknown>
  extends CoreCommandMiddleware<
  Client, CommandInteraction, O, Return
  > {}
