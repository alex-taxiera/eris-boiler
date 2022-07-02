import {
  AutocompleteInteraction,
  Client,
  CommandInteraction,
} from 'eris'

import { Forge as CoreForge } from '@hephaestus/core'

import { unknownHasKey } from '@hephaestus/utils'

import {
  CommandMap,
  EventMap,
  PermissionMap,
  TopLevelCommand,
  Event,
} from './'
import { getValidSubCommands } from './interaction'

export class Forge extends CoreForge {

  public commands = new CommandMap('name')

  public events = new EventMap('name')

  public permissions = new PermissionMap('name')

  public readonly client: Client

  constructor (...args: ConstructorParameters<typeof Client>) {
    super()
    const [ token, options = { intents: [] } ] = args
    this.client = new Client(token, options)
  }

  private async registerCommand (
    command: TopLevelCommand,
  ): Promise<void> {
    if ('guildId' in command && command.guildId != null) {
      await this.client.createGuildCommand(command.guildId, command)
    } else {
      await this.client.createCommand(command)
    }
  }

  private registerEvent (event: Event): void {
    // @ts-expect-error this just won't compile lol
    this.client.on(event.name, event.handler)
  }

  public async connect (): Promise<void> {
    await Promise.all([
      this.commands.load(),
      this.events.load(),
      this.permissions.load(),
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
        const middlewares = [ ...command.middleware ?? [] ]
        let permission = command.permission ?? null

        let action = command.action
        let options = command.options
        let interactionOptions = interaction.data.options

        if (command.action == null) {
          // look for sub command or sub command group
          if (interaction.data.options == null || command.options == null) {
            throw new Error(
              `Command \`${interaction.data.name}\` is not executable.`,
            )
          }
          const option = interaction.data.options[0]
          const subCommand = getValidSubCommands(command.options).find(
            (command) => command.name === option.name,
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
            options = subCommand.options
            const subCommandOption = interactionOptions?.find(
              (option) => option.name === subCommand.name)
            if (subCommandOption?.type === 1) {
              interactionOptions = subCommandOption.options
            }
          } else {
            // sub command group
            if (
              !('options' in option) ||
              option.options == null ||
              subCommand.options == null
            ) {
              throw new Error(
                `Command \`${option.name}\` is not executable.`,
              )
            }

            const lastOption = option.options[0]
            const lastCommand = subCommand.options.find(
              (command) => command.name === lastOption.name,
            )
            if (!lastCommand) {
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
            options = lastCommand.options
            const lastCommandOption = interactionOptions?.find(
              (option) => option.name === lastCommand.name)
            if (lastCommandOption?.type === 1) {
              interactionOptions = lastCommandOption.options
            }
          }
        }

        if (isAutocomplete) {
          const focusedOption = interactionOptions
            ?.find((option) => 'focused' in option)
          let option
          for (const opt of options ?? []) {
            if (opt.name === focusedOption?.name) {
              option = opt
              break
            }
          }

          if (!option || !('autocomplete' in option) || !option.autocomplete) {
            await interaction.result([])
            return
          }

          void option.autocompleteAction(interaction, this.client)
          return
        }

        if (!action) {
          throw new Error(
            `Command \`${interaction.data.name}\` is not executable.`,
          )
        }

        if (permission != null) {
          const level = permission.level
          let hasPermission = await permission.action(interaction, this.client)
          if (!hasPermission) {
            const overrides = this.permissions
              .filter((perm) => perm.level > level)
              .sort((a, b) => a.level - b.level)

            for (const override of overrides) {
              hasPermission = await override.action(interaction, this.client)
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
              content: permission.reason ??
                'You do not have permission to use this command.',
              flags: 64,
            })
            return
          }
        }

        for (const middleware of middlewares) {
          try {
            await middleware.action(interaction, this.client)
          } catch (error) {
            const invoker = interaction.acknowledged
              ? 'createFollowup'
              : 'createMessage'

            await interaction[invoker]({
              content: (unknownHasKey(error, 'message') &&
              typeof error.message === 'string')
                ? error.message
                : 'An error occured.',
              flags: 64,
            })
          }
        }

        void action(interaction, this.client)
      }
    })

    this.client.on('ready', async () => {
      await Promise.all(this.commands.map(
        async (command) => await this.registerCommand(command),
      ))
    })

    await this.client.connect()
  }

}
