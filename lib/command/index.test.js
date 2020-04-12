import test from 'ava'
import sinon from 'sinon'

import {
  Command,
  SettingCommand,
  ToggleCommand
} from './'

import DataClient from '../data-client'

test('Command/info/basic', (t) => {
  const mockData = {
    name: 'test-command-name',
    description: 'test-command-desc'
  }

  const basicCommand = new Command(mockData)
  const expected = [
    `Name: ${mockData.name}`,
    `Description: ${mockData.description}`
  ].join('\n')

  t.is(basicCommand.info, expected)
})

test('Command/info/advanced', (t) => {
  const mockData = {
    name: 'test-command-name',
    description: 'test-command-desc',
    options: {
      aliases: [
        'alias-one',
        'alias-two'
      ],
      parameters: [
        'param-one',
        'param-two'
      ],
      subCommands: [
        new Command({
          name: 'sub-command-one',
          description: 'sub-command-one',
          options: {
            aliases: [ 'alias' ]
          }
        }),
        new Command({
          name: 'sub-command-two',
          description: 'sub-command-two'
        })
      ]
    }
  }

  const advancedCommand = new Command(mockData)
  const expected = [
    `Name: ${mockData.name}`,
    `Aliases: ${mockData.options.aliases.join(', ')}`,
    `Description: ${mockData.description}`,
    `Parameters: ${mockData.options.parameters.join(', ')}`,
    '\nSub Commands',
    mockData.options.subCommands.map((command) => command.info).join('\n\n')
  ].join('\n')

  t.is(advancedCommand.info, expected)
})

test('Command/type error for sub commands', (t) => {
  const mockData = {
    name: 'test-command-name',
    description: 'test-command-desc',
    options: {
      subCommands: [
        { test: 'bad' }
      ]
    }
  }

  t.throws(
    () => new Command(mockData),
    {
      instanceOf: TypeError,
      message: 'INVALID_COMMAND'
    }
  )
})

test('SettingCommand/works', (t) => {
  const mockData = {
    name: 'test-setting-command-name',
    description: 'test-setting-command-desc',
    setting: 'test',
    displayName: 'TEST',
    getValue: () => 'wheee'
  }
  const command = new SettingCommand(mockData)

  t.truthy(command)
})

test('ToggleCommand/getValue/returns enabled', async (t) => {
  const mockData = {
    name: 'test-toggle-command-name',
    description: 'test-toggle-command-desc',
    setting: 'test',
    displayName: 'TEST'
  }
  const context = {
    msg: {
      channel: {
        guild: {
          id: 2
        }
      }
    }
  }
  const bot = new DataClient()
  sinon.stub(bot.dbm, 'newQuery')
    .callsFake(() => ({ get: () => ({ get: () => true }) }))
  const command = new ToggleCommand(mockData)
  const res = await command.getValue(bot, context)

  t.is(res, 'Enabled')
})

test('ToggleCommand/getValue/returns disabled', async (t) => {
  const mockData = {
    name: 'test-toggle-command-name',
    description: 'test-toggle-command-desc',
    setting: 'test',
    displayName: 'TEST'
  }
  const context = {
    msg: {
      channel: {
        guild: {
          id: 2
        }
      }
    }
  }
  const bot = new DataClient()
  sinon.stub(bot.dbm, 'newQuery')
    .callsFake(() => ({ get: () => ({ get: () => false }) }))
  const command = new ToggleCommand(mockData)
  const res = await command.getValue(bot, context)

  t.is(res, 'Disabled')
})

test('ToggleCommand/getValue/throws', (t) => {
  const mockData = {
    name: 'test-toggle-command-name',
    description: 'test-toggle-command-desc',
    setting: 'test',
    displayName: 'TEST'
  }
  const context = {
    msg: {
      channel: {
        guild: {
          id: 2
        }
      }
    }
  }
  const bot = new DataClient()
  sinon.stub(bot.dbm, 'newQuery')
    .callsFake(() => ({ get: () => {} }))
  const command = new ToggleCommand(mockData)

  return t.throwsAsync(
    () => command.getValue(bot, context),
    {
      instanceOf: Error,
      message: 'fuck'
    }
  )
})

test('ToggleCommand/run/enables', async (t) => {
  const mockData = {
    name: 'test-toggle-command-name',
    description: 'test-toggle-command-desc',
    setting: 'test',
    displayName: 'TEST'
  }
  const context = {
    msg: {
      channel: {
        guild: {
          id: 2
        }
      }
    }
  }
  const dbGuild = {
    save: sinon.spy(),
    get: () => false
  }
  const bot = new DataClient()
  sinon.stub(bot.dbm, 'newQuery')
    .callsFake(() => ({ get: () => dbGuild }))
  const command = new ToggleCommand(mockData)
  await command.run(bot, context)

  t.true(dbGuild.save.calledOnceWithExactly({
    [mockData.setting]: true
  }))
})

test('ToggleCommand/run/disables', async (t) => {
  const mockData = {
    name: 'test-toggle-command-name',
    description: 'test-toggle-command-desc',
    setting: 'test',
    displayName: 'TEST'
  }
  const context = {
    msg: {
      channel: {
        guild: {
          id: 2
        }
      }
    }
  }
  const dbGuild = {
    save: sinon.spy(),
    get: () => true
  }
  const bot = new DataClient()
  sinon.stub(bot.dbm, 'newQuery')
    .callsFake(() => ({ get: () => dbGuild }))
  const command = new ToggleCommand(mockData)
  await command.run(bot, context)

  t.true(dbGuild.save.calledOnceWithExactly({
    [mockData.setting]: false
  }))
})

test('ToggleCommand/run/throws', (t) => {
  const mockData = {
    name: 'test-toggle-command-name',
    description: 'test-toggle-command-desc',
    setting: 'test',
    displayName: 'TEST'
  }
  const context = {
    msg: {
      channel: {
        guild: {
          id: 2
        }
      }
    }
  }
  const bot = new DataClient()
  sinon.stub(bot.dbm, 'newQuery')
    .callsFake(() => ({ get: () => {} }))
  const command = new ToggleCommand(mockData)

  return t.throwsAsync(
    () => command.run(bot, context),
    {
      instanceOf: Error,
      message: 'fuck'
    }
  )
})
