import {
  ApplicationCommandOptionsSubCommand,
  ApplicationCommandOptionsSubCommandGroup,
  ApplicationCommandOptionsWithValue,
  ChatInputApplicationCommandStructure,
  MessageApplicationCommandStructure,
  UserApplicationCommandStructure,
  Client,
  CommandInteraction,
} from 'eris'

import {
  Command as CoreCommand,
  ExecutableCommand as CoreExecutableCommand,
  CommandMap as CoreCommandMap,
} from '@hephaestus/core'

type Command = CoreCommand<Client, CommandInteraction>

export type ExecutableCommand =
CoreExecutableCommand<Client, CommandInteraction>

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

export type SubCommand = ApplicationCommandOptionsSubCommand & ExecutableCommand

// TODO: figure out how to know when options has to be sub commands/groups
export type TopLevelCommand =
& Omit<ChatInputApplicationCommandStructure, 'options'>
& Command
& ({
  options?: Array<SubCommandGroup | SubCommand>
} | (ExecutableCommand & {
  options?: ApplicationCommandOptionsWithValue[]
}))

export class CommandMap extends CoreCommandMap<TopLevelCommand> {}
