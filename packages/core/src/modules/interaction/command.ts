import {
  Promisable,
  UnionToIntersection,
} from 'type-fest'
import { unknownHasKey } from '@hephaestus/utils'

import { Anvil } from '@modules/loadable'
import { Hephaestus } from '@modules/client'

import { CommandMiddleware } from './middleware'
import { Permission } from './permission'

export type AutocompleteAction<Interaction, Option, H extends Hephaestus> = (
  interaction: Interaction,
  focusedOption: Option,
  hephaestus: H,
) => Promisable<void>

export interface Command<Client, Interaction> {
  name: string
  permission?: Permission<Client, Interaction>
  middleware?: Array<CommandMiddleware<Client, Interaction>>
  guildId?: string
}

export type CommandAction<Interaction, H extends Hephaestus> = (
  interaction: Interaction,
  hephaestus: H,
) => Promisable<void>

export type CommandActionWithOptions<
Interaction, OptionsMap, H extends Hephaestus,
> = (
  interaction: Interaction,
  data: OptionsMap,
  hephaestus: H,
) => Promisable<void>

export interface BaseOption {
  name: string
  required?: boolean
  type: number
}

export type ConvertOptionsToArgs<
T extends readonly BaseOption[], D,
> = UnionToIntersection<{
  [P in keyof T]: {
    [_ in T[P]['name']]: T[P]['required'] extends true
      ? { type: T[P]['type'] } & D
      : { type: T[P]['type'] } & D | undefined
  }
}[number]>

export abstract class CommandAnvil<
T extends Command<any, any>,
> extends Anvil<T> {

  protected isValid (loadable: unknown): loadable is T {
    if (loadable == null || typeof loadable !== 'object') {
      return false
    }

    if (!unknownHasKey(loadable, 'name')) {
      return false
    }

    if (
      !unknownHasKey(loadable, 'action')
    ) {
      if (
        !unknownHasKey(loadable, 'options') ||
        !Array.isArray(loadable.options)
      ) {
        return false
      }

      return loadable.options.some((option) => {
        if (unknownHasKey(option, 'type')) {
          if (typeof option.type === 'number' && option.type <= 2) {
            return true
          }
        }

        return false
      })
    }

    return true
  }

}
