import {
  Client,
  CommandInteraction,
} from 'eris'

import { CommandMiddleware as CoreCommandMiddleware } from '@hephaestus/core'

export interface CommandMiddleware<Return = unknown>
  extends CoreCommandMiddleware<
  Client, CommandInteraction, Return
  > {}
