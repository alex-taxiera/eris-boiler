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
SO extends readonly ApplicationCommandOption[] = [],
O extends ReadonlyArray<SubCommand<SO>> = []> =
& ApplicationCommandOptionsSubCommandGroup
& Command
& {
  options?: O
}

export type SubCommand<
O extends readonly ApplicationCommandOption[] = []> =
& ApplicationCommandOptionsSubCommand
& Command
& {
  options?: O
  action: CommandActionWithOptions<O>
}

export type BaseTopLevelCommand =
& Omit<ChatInputApplicationCommandStructure, 'options'>
& Command

export type ExecutableTopLevelCommand<
O extends readonly ApplicationCommandOption[] = [],
> =
& BaseTopLevelCommand
& {
  options?: O
  action: CommandActionWithOptions<O>
}

export type TopLevelCommandWithSubCommands<
SO extends readonly ApplicationCommandOption[] = [],
O extends ReadonlyArray<SubCommandGroup<SO> | SubCommand> = []> =
& BaseTopLevelCommand
& {
  options: O
  action?: never
}

export type TopLevelCommand<
SO extends readonly ApplicationCommandOption[] =
ApplicationCommandOption[],
O extends readonly ApplicationCommandOption[]
| ReadonlyArray<SubCommandGroup | SubCommand>
= ApplicationCommandOption[]
| ReadonlyArray<SubCommandGroup | SubCommand>,
> =
  O extends Array<SubCommandGroup | SubCommand>
    ? TopLevelCommandWithSubCommands<SO, O>
    : O extends readonly ApplicationCommandOption[]
      ? ExecutableTopLevelCommand<O>
      : never

export function isApplicationCommandOption (
  option:
  | SubCommandGroup
  | SubCommand
  | ApplicationCommandOption,
): option is SubCommandGroup | SubCommand {
  return option.type >= 3
}

export function getValidSubCommands (options: Array<
| SubCommandGroup
| SubCommand
| ApplicationCommandOption
>): Array<SubCommandGroup | SubCommand> {
  return options.filter(
    (option) => !isApplicationCommandOption(option),
  ) as Array<SubCommandGroup | SubCommand>
}

export class CommandMap extends CoreCommandAnvil<TopLevelCommand> {}

export function createCommand<
SO extends readonly ApplicationCommandOption[],
O extends
| readonly ApplicationCommandOption[]
| ReadonlyArray<SubCommandGroup | SubCommand>,
> (data: TopLevelCommand<SO, O>): TopLevelCommand<SO, O> {
  return data
}
