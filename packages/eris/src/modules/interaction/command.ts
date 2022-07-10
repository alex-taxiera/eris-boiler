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
AutocompleteInteraction,
{ type: T, focused: true } & InteractionDataOptionsWithValue,
Hephaestus
>

export type AutocompleteCommandOption<T extends 3 | 4 | 10 = 3 | 4 | 10> =
& BaseApplicationCommandOption
& {
  type: T
  choices?: never
  autocomplete: true
  autocompleteAction: AutocompleteAction<T>
}

type NoAutocompleteCommandOption =
& BaseApplicationCommandOption
& {
  autocomplete?: false
  autocompleteAction?: never
  choices?: readonly ApplicationCommandOptionChoice[]
}

export type BaseApplicationCommandOption =
& Omit<ApplicationCommandOptionsWithValue, 'choices'>
& { choices?: readonly ApplicationCommandOptionChoice[] | null }

export type ApplicationCommandOption =
| NoAutocompleteCommandOption
| AutocompleteCommandOption

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

// const x = createCommand({
//   type: 1,
//   name: 'get',
//   description: 'Finds, Adds, Remove, or Edit tags',
//   options: [
//     {
//       type: 4,
//       name: 'name',
//       description: 'The tag to get',
//       required: true,
//       autocomplete: true,
//       autocompleteAction: (int, option) => {
//         console.log(option.value)
//       },
//     },
//   ] as const,
//   action: (interaction, args) => {
//     console.log(args.name.value)
//   },
// })

// console.log(x)
