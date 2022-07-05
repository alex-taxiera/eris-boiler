import {
  ApplicationCommandOptionsSubCommand,
  ApplicationCommandOptionsSubCommandGroup,
  ApplicationCommandOptionsWithValue,
  ChatInputApplicationCommandStructure,
  MessageApplicationCommandStructure,
  UserApplicationCommandStructure,
  Client,
  CommandInteraction,
  AutocompleteInteraction,
  InteractionDataOptionsWithValue,
} from 'eris'

import {
  Command as CoreCommand,
  ExecutableCommand as CoreExecutableCommand,
  CommandMap as CoreCommandMap,
  AutoCompleteOption as CoreAutoCompleteOption,
} from '@hephaestus/core'

interface AutocompleteCommandOption
  extends CoreAutoCompleteOption<
  Client, AutocompleteInteraction, InteractionDataOptionsWithValue
  > {
  autocomplete: true
}

interface NoAutocompleteCommandOption {
  autocomplete?: false
  autocompleteAction?: never
}

export type ApplicationCommandOption =
& ApplicationCommandOptionsWithValue
& (AutocompleteCommandOption | NoAutocompleteCommandOption)

type Command = CoreCommand<Client, CommandInteraction>

export type ExecutableCommand =
CoreExecutableCommand<
Client,
CommandInteraction,
InteractionDataOptionsWithValue
>

export type UserCommand = UserApplicationCommandStructure & ExecutableCommand
export type MessageCommand =
& MessageApplicationCommandStructure
& ExecutableCommand

export type SubCommandGroup =
& ApplicationCommandOptionsSubCommandGroup
& Command
& {
  options?: SubCommand[]
}

export type SubCommand =
& ApplicationCommandOptionsSubCommand
& ExecutableCommand
& {
  options?: ApplicationCommandOption[]
}

export type BaseTopLevelCommand =
& Omit<ChatInputApplicationCommandStructure, 'options'>
& Command

export type ExecutableTopLevelCommand =
& BaseTopLevelCommand
& ExecutableCommand
& {
  options?: ApplicationCommandOption[]
}

export type TopLevelCommandWithSubCommands =
& BaseTopLevelCommand
& {
  options: Array<SubCommandGroup | SubCommand>
  action?: never
}

export type TopLevelCommand =
| TopLevelCommandWithSubCommands
| ExecutableTopLevelCommand

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

export class CommandMap extends CoreCommandMap<TopLevelCommand> {}
