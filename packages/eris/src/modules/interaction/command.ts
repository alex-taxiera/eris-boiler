import {
  ApplicationCommandOptionsSubCommand,
  ApplicationCommandOptionsSubCommandGroup,
  ApplicationCommandOptionsWithValue,
  ChatInputApplicationCommandStructure,
  MessageApplicationCommandStructure,
  UserApplicationCommandStructure,
  Client,
  CommandInteraction,
  InteractionDataOptionWithValue,
  AutocompleteInteraction,
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

export type AutocompleteAction<T extends 3 | 4 | 10> = CoreAutocompleteAction<
AutocompleteInteraction, InteractionDataOptionWithValue<T>, Hephaestus
>

export type AutocompleteCommandOption<T extends 3 | 4 | 10 = 3> =
& ApplicationCommandOptionsWithValue
& {
  type: T
  autocomplete: true
  autocompleteAction: AutocompleteAction<T>
}

type NoAutocompleteCommandOption =
& ApplicationCommandOptionsWithValue
& {
  autocomplete?: false
  autocompleteAction?: never
}

export type ApplicationCommandOption =
| AutocompleteCommandOption
| NoAutocompleteCommandOption

export type Command = CoreCommand<Client, CommandInteraction>

export type CommandAction = CoreCommandAction<CommandInteraction, Hephaestus>

export type CommandActionWithOptions<
O extends readonly ApplicationCommandOption[],
> = CoreCommandActionWithOptions<
CommandInteraction, ConvertOptionsToArgs<O>, Hephaestus
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

export type SubCommand<O extends readonly ApplicationCommandOption[] = []> =
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
| ReadonlyArray<SubCommandGroup | SubCommand> = ApplicationCommandOption[]
| ReadonlyArray<SubCommandGroup | SubCommand>,
> =
  O extends Array<SubCommandGroup | SubCommand>
    ? TopLevelCommandWithSubCommands<SO, O>
    : O extends readonly ApplicationCommandOption[]
      ? ExecutableTopLevelCommand<O>
      : never

export function isNotApplicationCommandOption (
  option:
  | SubCommandGroup
  | SubCommand
  | ApplicationCommandOption,
): option is SubCommandGroup | SubCommand {
  return option.type < 3
}

export function getValidSubCommands (options: Array<
| SubCommandGroup
| SubCommand
| ApplicationCommandOption
>): Array<SubCommandGroup | SubCommand> {
  return options.filter(isNotApplicationCommandOption)
}

export class CommandMap extends CoreCommandAnvil<TopLevelCommand> {}

export function createCommand<
SO extends readonly ApplicationCommandOption[],
O extends
| readonly ApplicationCommandOption[]
| ReadonlyArray<SubCommandGroup | SubCommand>,
T extends TopLevelCommand<SO, O>,
> (data: T): T {
  return data
}
