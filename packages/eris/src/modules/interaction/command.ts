/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApplicationCommandOptionsSubCommand,
  ApplicationCommandOptionsSubCommandGroup,
  ApplicationCommandOptionsWithValue,
  ChatInputApplicationCommandStructure,
  MessageApplicationCommandStructure,
  UserApplicationCommandStructure,
  Client,
  CommandInteraction,
  InteractionDataOptionsWithValue,
  AutocompleteInteraction,
  ApplicationCommandOptionChoice,
  Constants,
} from 'eris'

import {
  Command as CoreCommand,
  CommandAction as CoreCommandAction,
  CommandActionWithOptions as CoreCommandActionWithOptions,
  CommandAnvil as CoreCommandAnvil,
  AutocompleteAction as CoreAutocompleteAction,
  ConvertOptionsToArgs,
} from '@hephaestus/core'
import { Hephaestus } from '@modules/client'

type AllCommandOptionTypes = typeof Constants.ApplicationCommandOptionTypes[
  keyof typeof Constants.ApplicationCommandOptionTypes
]

type ApplicationCommandOptionTypes = Exclude<AllCommandOptionTypes, 1 | 2>

type NumberCommandOptionTypes = Extract<ApplicationCommandOptionTypes, 4 | 10>

type AutocompleteCommandOptionTypes =
  Extract<ApplicationCommandOptionTypes, 3 | 4 | 10>

export type AutocompleteAction<
T extends AutocompleteCommandOptionTypes,
> = CoreAutocompleteAction<
AutocompleteInteraction,
{ type: T, focused: true } & InteractionDataOptionsWithValue,
Hephaestus
>

export type AutocompleteCommandOption<
T extends AutocompleteCommandOptionTypes,
> =
& BaseApplicationCommandOption<T>
& {
  type: T
  choices?: never
  autocomplete: true
  autocompleteAction: AutocompleteAction<T>
  // eslint-disable-next-line camelcase
  min_value?: never
  // eslint-disable-next-line camelcase
  max_value?: never
}

type NoAutocompleteCommandOption<T extends ApplicationCommandOptionTypes> =
& BaseApplicationCommandOption<T>
& {
  autocomplete?: false
  autocompleteAction?: never
  choices?: readonly ApplicationCommandOptionChoice[]
  // eslint-disable-next-line camelcase
  min_value?: never
  // eslint-disable-next-line camelcase
  max_value?: never
}

type MinMaxCommandOption<T extends NumberCommandOptionTypes> =
& BaseApplicationCommandOption<T>
& {
  autocomplete?: false
  autocompleteAction?: never
  choices?: null
  // eslint-disable-next-line camelcase
  min_value?: number
  // eslint-disable-next-line camelcase
  max_value?: number
}

export type BaseApplicationCommandOption<
T extends ApplicationCommandOptionTypes,
> =
& Omit<
ApplicationCommandOptionsWithValue, 'choices' | 'min_value' | 'max_value'
>
& { type: T, choices?: readonly ApplicationCommandOptionChoice[] | null }

export type ApplicationCommandOption<
T extends ApplicationCommandOptionTypes = ApplicationCommandOptionTypes,
> =
T extends AutocompleteCommandOptionTypes
  ? T extends NumberCommandOptionTypes
    ? | NoAutocompleteCommandOption<T>
      | AutocompleteCommandOption<T>
      | MinMaxCommandOption<T>
    : NoAutocompleteCommandOption<T> | AutocompleteCommandOption<T>
  : T extends NumberCommandOptionTypes
    ? NoAutocompleteCommandOption<T> | MinMaxCommandOption<T>
    : NoAutocompleteCommandOption<T>

export type Command = CoreCommand<Client, CommandInteraction>

export type CommandAction = CoreCommandAction<CommandInteraction, Hephaestus>

export type CommandActionWithOptions<
O extends readonly ApplicationCommandOption[],
> = CoreCommandActionWithOptions<
CommandInteraction, ConvertOptionsToArgs<
O, InteractionDataOptionsWithValue
>, Hephaestus
>

export type UserCommand =
& UserApplicationCommandStructure
& {
  action: CommandAction
}

export type MessageCommand =
& MessageApplicationCommandStructure
& {
  action: CommandAction
}

export type SubCommandGroup<
SO extends readonly ApplicationCommandOption[],
O extends ReadonlyArray<SubCommand<SO>>> =
& Omit<ApplicationCommandOptionsSubCommandGroup, 'options'>
& Command
& {
  options?: O
}

export type SubCommand<O extends readonly ApplicationCommandOption[]> =
& Omit<ApplicationCommandOptionsSubCommand, 'options'>
& Command
& {
  options?: O
  action: CommandActionWithOptions<O>
}

export type BaseCommand =
& Omit<ChatInputApplicationCommandStructure, 'options'>
& Command

export type ExecutableCommand<
O extends readonly ApplicationCommandOption[] =
readonly ApplicationCommandOption[],
> =
& BaseCommand
& {
  options?: O
  action: CommandActionWithOptions<O>
}

export type CommandWithSubCommands<
O extends ReadonlyArray<SubCommandGroup<any, any> | SubCommand<any>> =
ReadonlyArray<SubCommandGroup<any, any> | SubCommand<any>>,
> =
& BaseCommand
& {
  options: O
  action?: never
}

export type TopLevelCommand<
O extends readonly ApplicationCommandOption[]
| ReadonlyArray<SubCommandGroup<any, any> | SubCommand<any>> =
readonly ApplicationCommandOption[],
> =
O extends readonly ApplicationCommandOption[]
  ? ExecutableCommand<O>
  : O extends ReadonlyArray<SubCommandGroup<any, any> | SubCommand<any>>
    ? CommandWithSubCommands<O>
    : never

export function isApplicationCommandOption (
  option:
  | SubCommandGroup<any, any>
  | SubCommand<any>
  | ApplicationCommandOption,
): option is SubCommandGroup<any, any> | SubCommand<any> {
  return option.type >= 3
}

export function getValidSubCommands (options: Array<
| SubCommandGroup<any, any>
| SubCommand<any>
| ApplicationCommandOption
>): Array<SubCommandGroup<any, any> | SubCommand<any>> {
  return options.filter(
    (option) => !isApplicationCommandOption(option),
  ) as Array<SubCommandGroup<any, any> | SubCommand<any>>
}

export class CommandMap extends CoreCommandAnvil<TopLevelCommand> {}

export function createCommand<
  O extends
  | readonly ApplicationCommandOption[]
  | ReadonlyArray<SubCommandGroup<any, any> | SubCommand<any>>,
> (data: TopLevelCommand<O>): TopLevelCommand<O> {
  return data
}

export function createSubCommand<
O extends readonly ApplicationCommandOption[],
> (data: SubCommand<O>): SubCommand<O> {
  return data
}
