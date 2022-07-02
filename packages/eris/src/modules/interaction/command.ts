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
} from 'eris'

import {
  Command as CoreCommand,
  ExecutableCommand as CoreExecutableCommand,
  CommandMap as CoreCommandMap,
  AutoCompleteOption as CoreAutoCompleteOption,
} from '@hephaestus/core'

interface AutocompleteCommandOption
  extends CoreAutoCompleteOption<Client, AutocompleteInteraction> {
  autocomplete: true
}

interface NoAutocompleteCommandOption {
  autocomplete?: false
  autocompleteAction?: never
}

export type ApplicationCommandOption =
& ApplicationCommandOptionsWithValue
& (AutocompleteCommandOption | NoAutocompleteCommandOption)

type Command<Interaction = CommandInteraction> =
  CoreCommand<Client, Interaction>

export type ExecutableCommand<Interaction = CommandInteraction> =
CoreExecutableCommand<Client, Interaction>

export type UserCommand = UserApplicationCommandStructure & ExecutableCommand
export type MessageCommand =
& MessageApplicationCommandStructure
& ExecutableCommand

export type SubCommandGroup =
& Omit<ApplicationCommandOptionsSubCommandGroup, 'options'>
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
  options?: Array<SubCommandGroup | SubCommand>
}

export type TopLevelCommand =
| TopLevelCommandWithSubCommands
| ExecutableTopLevelCommand

export function getValidSubCommands (options: Array<
| SubCommandGroup
| SubCommand
| ApplicationCommandOption
>): Array<SubCommandGroup | SubCommand> {
  return options
    .filter((option) => option.type < 3) as Array<SubCommandGroup | SubCommand>
}

export class CommandMap extends CoreCommandMap<TopLevelCommand> {}
