
import {
  TopLevelCommand,
  Permission,
  Forge,
  SubCommandGroup,
  SubCommand,
} from './'

const permission: Permission = {
  name: 'test',
  level: 1,
  reason: 'You must be an admin to use this command.',
  action: (interaction, client) => {
    return false
  },
}

export const command: TopLevelCommand = {
  guildId: '436591833196265473',
  type: 1,
  name: 'test',
  description: 'Test command',
  middleware: [],
  permission,
  action: async (interaction, client) => {
    await interaction.createMessage('Test command')
  },
}

const sub1: SubCommand = {
  type: 1,
  name: 'sub1',
  description: 'Sub command 1',
  action: async (interaction, client) => {
    await interaction.createMessage('Sub command 1')
  },
}

const sub2: SubCommand = {
  type: 1,
  name: 'sub2',
  description: 'Sub command 2',
  middleware: [ { action: () => { console.log('middleware4') } } ],
  action: async (interaction, client) => {
    await interaction.createMessage('Sub command 2')
  },
}

const group: SubCommandGroup = {
  type: 2,
  name: 'group',
  description: 'Sub command group',
  options: [ sub1, sub2 ],
  middleware: [ { action: () => { console.log('middleware3') } } ],
}

export const command2: TopLevelCommand = {
  guildId: '436591833196265473',
  type: 1,
  name: 'parent',
  description: 'Test command',
  middleware: [
    { action: () => { console.log('middleware1') } },
    { action: () => { console.log('middleware2') } },
  ],
  options: [ group ],
  // action: async (interaction, client) => {
  //   await interaction.createMessage('Test command')
  // },
}

const hammer = new Forge(
  'NDM2NTc2NzkwMjUzNzk3Mzk2.DyOLRg.eDv3f6rtipwVU95IOsrPWno_hNg',
)

hammer.commands.add([ command, command2 ])

hammer.connect().catch(console.error)
