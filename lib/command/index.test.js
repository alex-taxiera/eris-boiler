import test from 'ava'

import Command from './'

test('info/basic', (t) => {
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

test('info/advanced', (t) => {
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
    `\nSub Commands`,
    mockData.options.subCommands.map((command) => command.info).join('\n\n')
  ].join('\n')

  t.is(advancedCommand.info, expected)
})

test('constructor/type error for sub commands', (t) => {
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
