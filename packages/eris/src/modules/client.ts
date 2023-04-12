import {
  ApplicationCommandStructure,
  AutocompleteInteraction,
  Client,
  CommandInteraction,
  InteractionDataOptionsWithValue,
} from 'eris'

import { Hephaestus as CoreHephaestus } from '@hephaestus/core'

import { unknownHasKey } from '@hephaestus/utils'

import {
  CommandMap,
  EventAnvil,
  PermissionAnvil,
  TopLevelCommand,
  Event,
  ApplicationCommandOption,
  getValidSubCommands,
  CommandAction,
  CommandActionWithOptions,
} from './'

export class Hephaestus extends CoreHephaestus {
  public commands = new CommandMap('name')

  public events = new EventAnvil('name')

  public permissions = new PermissionAnvil('name')

  public readonly client: Client

  constructor(...args: ConstructorParameters<typeof Client>) {
    super()
    const [token, options = { intents: [] }] = args
    this.client = new Client(token, options)
  }

  private async registerCommand(command: TopLevelCommand): Promise<void> {
    if ('guildId' in command && command.guildId != null) {
      await this.client.createGuildCommand(
        command.guildId,
        command as ApplicationCommandStructure
      )
    } else {
      await this.client.createCommand(command as ApplicationCommandStructure)
    }
  }

  private registerEvent(event: Event): void {
    // @ts-expect-error this just won't compile lol
    this.client.on(event.name, event.handler)
  }

  public async connect(): Promise<void> {
    await Promise.all([
      this.commands.hammer(),
      this.events.hammer(),
      this.permissions.hammer(),
    ])

    this.events.forEach((event) => this.registerEvent(event))

    this.client.on('interactionCreate', async (interaction) => {
      const isCommand = interaction instanceof CommandInteraction
      const isAutocomplete = interaction instanceof AutocompleteInteraction
      if (isCommand || isAutocomplete) {
        const command = this.commands.get(interaction.data.name)
        if (command == null) {
          if (isAutocomplete) {
            await interaction.result([])
            return
          }
          await interaction.createMessage({
            content: `Command \`${interaction.data.name}\` not found.`,
            flags: 64,
          })
          return
        }
        const middlewares = [...(command.middleware ?? [])]
        let permission = command.permission ?? null

        let action:
          | CommandAction
          | CommandActionWithOptions<readonly ApplicationCommandOption[]>
          | undefined
        let options: readonly ApplicationCommandOption[] | undefined
        let interactionOptions: InteractionDataOptionsWithValue[] | undefined

        if (command.action != null) {
          action = command.action
          options = command.options
          interactionOptions = interaction.data
            .options as InteractionDataOptionsWithValue[]
        } else {
          // look for sub command or sub command group
          if (interaction.data.options == null || command.options == null) {
            throw new Error(
              `Command \`${interaction.data.name}\` is not executable.`
            )
          }
          const option = interaction.data.options[0]
          const subCommand = getValidSubCommands(command.options).find(
            (command) => command.name === option.name
          )

          if (!subCommand) {
            throw new Error(`Command \`${option.name}\` not found.`)
          }

          if (subCommand.middleware != null) {
            middlewares.push(...subCommand.middleware)
          }
          if (
            subCommand.permission != null &&
            (permission == null ||
              permission.level < subCommand.permission.level)
          ) {
            permission = subCommand.permission
          }

          if (subCommand.type === 1) {
            action = subCommand.action
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            options = subCommand.options
            if (option.type === 1) {
              interactionOptions =
                option.options as InteractionDataOptionsWithValue[]
            }
          } else {
            // sub command group
            if (
              !('options' in option) ||
              option.options == null ||
              subCommand.options == null
            ) {
              throw new Error(`Command \`${option.name}\` is not executable.`)
            }

            const lastOption = option.options[0]
            const lastCommand = getValidSubCommands(subCommand.options).find(
              (command) => command.name === option.name
            )
            if (!lastCommand || lastCommand.type !== 1) {
              throw new Error(`Command \`${lastOption.name}\` not found.`)
            }
            if (lastCommand.middleware != null) {
              middlewares.push(...lastCommand.middleware)
            }
            if (
              lastCommand.permission != null &&
              (permission == null ||
                permission.level < lastCommand.permission.level)
            ) {
              permission = lastCommand.permission
            }
            action = lastCommand.action
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            options = lastCommand.options
            if (lastOption?.type === 1) {
              interactionOptions =
                lastOption.options as InteractionDataOptionsWithValue[]
            }
          }
        }

        if (isAutocomplete) {
          const focusedOption = interactionOptions?.find(
            (option) => 'focused' in option
          )
          let option
          for (const opt of options ?? []) {
            if (opt.name === focusedOption?.name) {
              option = opt
              break
            }
          }

          if (
            !focusedOption ||
            !option ||
            !('autocomplete' in option) ||
            !option.autocomplete
          ) {
            await interaction.result([])
            return
          }

          void option.autocompleteAction(
            interaction,
            focusedOption as never, // HACK: the function signature is messed up unless you narrow the type of "option"
            this
          )

          return
        }

        const optionsMap =
          interactionOptions?.reduce(
            (ax, dx) => ({ ...ax, [dx.name]: dx }),
            {}
          ) ?? {}

        if (permission != null) {
          const level = permission.level
          let hasPermission = await permission.action(
            interaction,
            optionsMap,
            this.client
          )
          if (!hasPermission) {
            const overrides = this.permissions
              .filter((perm) => perm.level > level)
              .sort((a, b) => a.level - b.level)

            for (const override of overrides) {
              hasPermission = await override.action(
                interaction,
                optionsMap,
                this.client
              )
              if (hasPermission) {
                break
              }
            }
          }

          if (!hasPermission) {
            const invoker = interaction.acknowledged
              ? 'createFollowup'
              : 'createMessage'

            await interaction[invoker]({
              content:
                permission.reason ??
                'You do not have permission to use this command.',
              flags: 64,
            })
            return
          }
        }

        for (const middleware of middlewares) {
          try {
            await middleware.action(interaction, optionsMap, this.client)
          } catch (error) {
            const invoker = interaction.acknowledged
              ? 'createFollowup'
              : 'createMessage'

            await interaction[invoker]({
              content:
                unknownHasKey(error, 'message') &&
                typeof error.message === 'string'
                  ? error.message
                  : 'An error occured.',
              flags: 64,
            })
          }
        }

        void action(interaction, optionsMap ?? {}, this)
      }
    })

    this.client.on('ready', async () => {
      await Promise.all(
        this.commands.map(
          async (command) => await this.registerCommand(command)
        )
      )
    })

    await this.client.connect()
  }
}
