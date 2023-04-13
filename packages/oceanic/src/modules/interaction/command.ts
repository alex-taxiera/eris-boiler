import type {
  Client,
  ApplicationCommandOptionTypes as AllCommandOptionTypes,
  ApplicationCommandOptionBase,
  ApplicationCommandOptionsSubCommandGroup,
  CreateChatInputApplicationCommandOptions,
  CreateUserApplicationCommandOptions,
  CreateMessageApplicationCommandOptions,
  AutocompleteInteraction,
  CommandInteraction,
  InteractionOptionsWithValue,
  ExclusifyUnion,
  ApplicationCommandOptionsTypesWithChoices,
  ApplicationCommandOptionsMinMaxValue,
  ApplicationCommandOptionsChoices,
  ApplicationCommandOptionsMinMaxLength,
} from 'oceanic.js'

import {
  Command as CoreCommand,
  CommandAction as CoreCommandAction,
  CommandActionWithOptions as CoreCommandActionWithOptions,
  CommandAnvil as CoreCommandAnvil,
  AutocompleteAction as CoreAutocompleteAction,
  ConvertOptionsToArgs,
} from '@hephaestus/core'
import { Hephaestus } from '@modules/client'

export type AutocompleteAction<
  T extends ApplicationCommandOptionsTypesWithChoices
> = CoreAutocompleteAction<
  AutocompleteInteraction,
  { type: T; focused: true } & InteractionOptionsWithValue,
  Hephaestus
>

export interface AutocompleteCommandOption<
  T extends ApplicationCommandOptionsTypesWithChoices = ApplicationCommandOptionsTypesWithChoices
> {
  autocomplete: true
  autocompleteAction: AutocompleteAction<T>
}

export type ApplicationCommandOptionsInteger =
  ApplicationCommandOptionBase<AllCommandOptionTypes.INTEGER> &
    ExclusifyUnion<
      | AutocompleteCommandOption<AllCommandOptionTypes.INTEGER>
      | ApplicationCommandOptionsMinMaxValue
      | ApplicationCommandOptionsChoices<AllCommandOptionTypes.INTEGER>
    >

export type ApplicationCommandOptionsNumber =
  ApplicationCommandOptionBase<AllCommandOptionTypes.NUMBER> &
    ExclusifyUnion<
      | AutocompleteCommandOption<AllCommandOptionTypes.NUMBER>
      | ApplicationCommandOptionsMinMaxValue
      | ApplicationCommandOptionsChoices<AllCommandOptionTypes.NUMBER>
    >
export type ApplicationCommandOptionsString =
  ApplicationCommandOptionBase<AllCommandOptionTypes.STRING> &
    ExclusifyUnion<
      | AutocompleteCommandOption<AllCommandOptionTypes.STRING>
      | ApplicationCommandOptionsMinMaxLength
      | ApplicationCommandOptionsChoices<AllCommandOptionTypes.STRING>
    >
export type ApplicationCommandOption = ApplicationCommandOptionsInteger

export type Command = CoreCommand<Client, CommandInteraction>

export type CommandAction = CoreCommandAction<CommandInteraction, Hephaestus>

export type CommandActionWithOptions<
  O extends readonly ApplicationCommandOption[]
> = CoreCommandActionWithOptions<
  CommandInteraction,
  ConvertOptionsToArgs<O, InteractionOptionsWithValue>,
  Hephaestus
>

export type UserCommand = CreateUserApplicationCommandOptions & {
  action: CommandAction
}

export type MessageCommand = CreateMessageApplicationCommandOptions & {
  action: CommandAction
}

export type SubCommandGroup = Omit<
  ApplicationCommandOptionsSubCommandGroup,
  'options'
> &
  Command & {
    options?: readonly ExecutableCommand[]
  }

export type BaseCommand = Omit<
  CreateChatInputApplicationCommandOptions,
  'options'
> &
  Command

export type ExecutableCommand<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  O extends readonly ApplicationCommandOption[] = any
> = BaseCommand & {
  options?: O
  action: CommandActionWithOptions<O>
}

export type CommandWithSubCommands<
  O extends ReadonlyArray<SubCommandGroup | ExecutableCommand> = ReadonlyArray<
    SubCommandGroup | ExecutableCommand
  >
> = BaseCommand & {
  options: O
  action?: never
}

export type TopLevelCommand<
  O extends
    | readonly ApplicationCommandOption[]
    | ReadonlyArray<
        SubCommandGroup | ExecutableCommand
      > = readonly ApplicationCommandOption[]
> = O extends readonly ApplicationCommandOption[]
  ? ExecutableCommand<O>
  : O extends ReadonlyArray<SubCommandGroup | ExecutableCommand>
  ? CommandWithSubCommands<O>
  : never

export function isApplicationCommandOption(
  option: SubCommandGroup | ExecutableCommand | ApplicationCommandOption
): option is SubCommandGroup | ExecutableCommand {
  return option.type >= 3
}

export function getValidSubCommands(
  options: ReadonlyArray<
    SubCommandGroup | ExecutableCommand | ApplicationCommandOption
  >
): Array<SubCommandGroup | ExecutableCommand> {
  const res = options.filter((option) => !isApplicationCommandOption(option))

  // @ts-expect-error typescript is eating my ass
  return res
}

export class CommandMap extends CoreCommandAnvil<TopLevelCommand> {}

export function createCommand<
  O extends
    | readonly ApplicationCommandOption[]
    | ReadonlyArray<SubCommandGroup | ExecutableCommand> = []
>(data: TopLevelCommand<O>): TopLevelCommand<O> {
  return data
}
