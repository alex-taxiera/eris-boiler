import test from 'ava'
import sinon from 'sinon'

import Orator from '.'
import Command from '../command'
import DataClient from '../data-client'

const me = {
  id: 'botId'
}

const buildOrator = (prefix = 'x', options = {
  deleteResponse: true,
  deleteInvoking: true
}) => new Orator(prefix, options)

const buildCommand = ({
  name = '',
  description = '',
  parameters,
  middleware,
  aliases,
  subCommands,
  permission,
  deleteInvoking,
  deleteResponse,
  dmOnly,
  guildOnly,
  run = () => null
} = {}) => new Command({
  name,
  description,
  run,
  options: {
    deleteInvoking,
    deleteResponse,
    parameters,
    middleware,
    aliases,
    subCommands,
    permission,
    dmOnly,
    guildOnly
  }
})

const buildMessage = ({
  content = '',
  mentions = [],
  deleteFn = async () => null,
  createMessageFn = async () => null,
  hasGuild = true,
  isMessageByBot = false,
  userId = '456',
  channelPerms = new Map(
    new Orator()._requiredSendPermissions.map((p) => [ p, true ])
  ),
  isDM = false
} = {}) => ({
  content,
  channel: {
    type: isDM ? 1 : 0,
    guild: hasGuild ? { id: '911' } : undefined,
    id: '123',
    createMessage: createMessageFn,
    permissionsOf: () => channelPerms
  },
  member: {
    id: userId
  },
  author: {
    id: userId,
    mention: 'this is a mention lol',
    bot: isMessageByBot,
    getDMChannel: async function () {
      return this.dmChannel
    },
    dmChannel: {
      createMessage: createMessageFn
    }
  },
  mentions,
  delete: deleteFn
})

test('tryMessageDelete/has manage messages', async (t) => {
  const orator = buildOrator()
  const channelPerms = new Map()
  channelPerms.set('manageMessages', true)
  const message = buildMessage({ channelPerms })
  sinon.spy(message, 'delete')

  await orator.tryMessageDelete(me, message)
  t.true(message.delete.calledOnce)
})

test('tryMessageDelete/own message', async (t) => {
  const orator = buildOrator()
  const message = buildMessage({ userId: me.id })
  sinon.spy(message, 'delete')

  await orator.tryMessageDelete(me, message)
  t.true(message.delete.calledOnce)
})

test('tryMessageDelete/cannot delete', async (t) => {
  const orator = buildOrator()
  const message = buildMessage()
  sinon.spy(message, 'delete')

  await orator.tryMessageDelete(me, message)
  t.false(message.delete.calledOnce)
})

test('tryMessageDelete/can delete someones message', async (t) => {
  const orator = buildOrator()
  const message = buildMessage()
  sinon.spy(message, 'delete')

  await orator.tryMessageDelete(me, message)
  t.false(message.delete.calledOnce)
})

test('tryMessageDelete/handles error', async (t) => {
  const orator = buildOrator()
  const message = buildMessage({ userId: me.id })
  const error = Error('test')
  sinon.stub(message, 'delete')
    .callsFake(async () => {
      throw error
    })

  return orator.tryMessageDelete(me, message)
    .then((res) => t.is(res, undefined))
})

test('tryCreateMessage/has sendMessages', async (t) => {
  const orator = buildOrator()
  const message = buildMessage()
  sinon.spy(message.channel, 'createMessage')
  const contents = [ 1, 2 ]

  await orator.tryCreateMessage(me, message.channel, ...contents)
  t.true(message.channel.createMessage.calledOnceWithExactly(...contents))
})

test('tryCreateMessage/has no permission', (t) => {
  const orator = buildOrator()
  const channelPerms = new Map()
  const message = buildMessage({ channelPerms })
  sinon.spy(message.channel, 'createMessage')
  const contents = [ 1, 2 ]

  const res = orator.tryCreateMessage(me, message.channel, ...contents)

  t.is(res, undefined)
  t.false(message.channel.createMessage.calledOnce)
})

test('tryCreateMessage/handles error', (t) => {
  const orator = buildOrator()
  const message = buildMessage()
  const error = Error('test')
  sinon.stub(message.channel, 'createMessage')
    .callsFake(async () => {
      throw error
    })
  const contents = [ 1, 2 ]

  return orator.tryCreateMessage(me, message.channel, ...contents)
    .then((res) => t.is(res, undefined))
})

test('tryDMCreateMessage/can DM user', async (t) => {
  const orator = buildOrator()
  const message = buildMessage()
  sinon.spy(message.author.dmChannel, 'createMessage')
  sinon.stub(orator, 'tryCreateMessage').callsFake(async () => null)
  const contents = [ 1, 2 ]

  await orator.tryDMCreateMessage(me, message, ...contents)
  t.true(
    message.author.dmChannel.createMessage.calledOnceWithExactly(...contents)
  )
  t.true(
    orator.tryCreateMessage
      .calledOnceWithExactly(me, message.channel, 'DM sent.', undefined)
  )
})

test('tryDMCreateMessage/getDMChannel Error', async (t) => {
  const orator = buildOrator()
  const message = buildMessage()
  sinon.stub(message.author, 'getDMChannel').callsFake(async () => {
    throw Error('bad guy')
  })
  sinon.stub(orator, 'tryCreateMessage').callsFake(async () => null)
  const contents = [ 1, 2 ]

  await orator.tryDMCreateMessage(me, message, ...contents)
  t.true(
    orator.tryCreateMessage
      .calledOnceWithExactly(me, message.channel, ...contents)
  )
})

test('tryDMCreateMessage/dm.createMessage Error', async (t) => {
  const orator = buildOrator()
  const message = buildMessage()
  sinon.stub(message.author.dmChannel, 'createMessage').callsFake(async () => {
    throw Error('bad guy')
  })
  sinon.stub(orator, 'tryCreateMessage').callsFake(async () => null)
  const contents = [ 1, 2 ]

  await orator.tryDMCreateMessage(me, message, ...contents)
  t.true(
    orator.tryCreateMessage
      .calledOnceWithExactly(me, message.channel, ...contents)
  )
})

test('_checkSubCommand/finds a subcommand', (t) => {
  const orator = buildOrator()
  const params = [ 1, 2 ]
  const expectedParams = [ ...params ].slice(1)
  const bot = new DataClient()
  const command = buildCommand({ name: 'parent' })
  const subCommand = buildCommand({ name: 'subber' })
  sinon.stub(bot, 'findCommand').callsFake(() => subCommand)
  const msg = buildMessage()

  const res = orator._checkSubCommand({ params, msg, bot, command })

  t.deepEqual(
    res,
    {
      bot,
      msg,
      params: expectedParams,
      command: subCommand
    }
  )
})

test('_checkSubCommand/does not find a subcommand', (t) => {
  const orator = buildOrator()
  const params = []
  const command = buildCommand()
  const msg = buildMessage()
  const bot = new DataClient()
  sinon.stub(bot, 'findCommand').callsFake(() => null)

  const res = orator._checkSubCommand({ bot, msg, command, params })

  t.is(res, undefined)
})

test('_cleanParams/splits params by space', (t) => {
  const orator = buildOrator()
  const content = 'THIS     IS     A TEST'

  t.deepEqual(orator._cleanParams(content), content.split(/\s+/))
})

test('_cleanParams/cleans up mentions', (t) => {
  const orator = buildOrator()
  const content = 'THIS     IS     A TEST <@1> <@&12> <@!123456789>'

  t.deepEqual(
    orator._cleanParams(content),
    content
      .split(/\s+/)
      .map((param) => param.replace(/<@[&|!]?([0-9]+)>/g, (m, c) => c))
  )
})

test('_tryToExecute/uses badCommand/guild command in dm', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_badCommand')
  const command = buildCommand({ parameters: [ 1, 2, 3 ] })
  const params = [ 1 ]
  const msg = buildMessage({ hasGuild: false })

  await orator._tryToExecute({ command, msg, params })
  t.true(
    orator._badCommand.calledOnceWithExactly(msg, 'only allowed in a guild')
  )
})

test('_tryToExecute/uses badCommand/dm command in guild', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_badCommand')
  const command = buildCommand({ parameters: [ 1, 2, 3 ], dmOnly: true })
  const params = [ 1 ]
  const msg = buildMessage()

  await orator._tryToExecute({ command, msg, params })
  t.true(
    orator._badCommand.calledOnceWithExactly(msg, 'only allowed in a dm')
  )
})

test('_tryToExecute/uses badCommand on not enough params', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_badCommand')
  const command = buildCommand({ parameters: [ 1, 2, 3 ] })
  const params = [ 1 ]
  const msg = buildMessage()

  await orator._tryToExecute({ command, msg, params })
  t.true(
    orator._badCommand.calledOnceWithExactly(msg, 'insufficient parameters!')
  )
})

test('_tryToExecute/uses badCommand on no permission', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_badCommand')
  sinon.stub(orator, 'hasPermission').callsFake(() => false)
  const command = buildCommand({ parameters: [ 1 ] })
  const params = [ 1 ]
  const msg = buildMessage()

  await orator._tryToExecute({ command, msg, params })
  t.true(
    orator._badCommand
      .calledOnceWithExactly(msg, 'You do not have the required permissions.')
  )
})

test('_tryToExecute/badCommand no permission custom message', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_badCommand')
  sinon.stub(orator, 'hasPermission').callsFake(() => false)
  const customMsg = 'woooohoooo'
  const command = buildCommand({
    parameters: [ 1 ],
    permission: { reason: customMsg }
  })
  const params = [ 1 ]
  const msg = buildMessage()

  await orator._tryToExecute({ command, msg, params })
  t.true(
    orator._badCommand
      .calledOnceWithExactly(msg, customMsg)
  )
})

test('_tryToExecute/recursion when subcommand is found', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_badCommand')
  sinon.spy(orator, '_tryToExecute')
  sinon.stub(orator, 'hasPermission').callsFake(() => true)
  const command = buildCommand({ parameters: [ 1 ] })
  const subCommand = buildCommand({ parameters: [ 1, 2, 3 ] })
  const params = [ 1 ]
  const msg = buildMessage()
  sinon.stub(orator, '_checkSubCommand')
    .callsFake(() => ({ params: [], command: subCommand, msg }))

  await orator._tryToExecute({ command, msg, params })
  t.true(orator._tryToExecute.calledTwice)
  t.deepEqual(
    orator._tryToExecute.getCall(1).args,
    [ orator._checkSubCommand() ]
  )
})

test('_tryToExecute/call middleware and return run', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_badCommand')
  sinon.spy(orator, '_tryToExecute')
  sinon.stub(orator, 'hasPermission').callsFake(() => true)
  sinon.stub(orator, '_checkSubCommand').callsFake(() => false)
  const command = buildCommand({
    parameters: [ 1 ],
    middleware: [ { run: () => null } ]
  })
  sinon.spy(command.middleware[0], 'run')
  sinon.spy(command, 'run')
  const params = [ 1 ]
  const msg = buildMessage()

  await orator._tryToExecute({ command, msg, params })
  t.true(command.run.calledOnceWithExactly({ command, msg, params }))
  t.true(
    command.middleware[0].run.calledOnceWithExactly({ command, msg, params })
  )
})

test('processMessage/ignore bots', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_isBotMessage').callsFake(() => true)
  sinon.spy(orator, '_tryToExecute')
  const bot = new DataClient()

  const res = await orator.processMessage(bot)

  t.is(res, undefined)
  t.false(orator._tryToExecute.called)
})

test('processMessage/does nothing without a command context', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_isBotMessage').callsFake(() => false)
  sinon.stub(orator, '_parseParamsForCommand').callsFake(async () => null)
  sinon.spy(orator, '_cleanParams')
  sinon.spy(orator, '_tryToExecute')
  const bot = new DataClient()
  const content = 'hehe'
  const msg = buildMessage({ content })

  const res = await orator.processMessage(bot, msg)

  t.is(res, undefined)
  t.true(orator._cleanParams.calledOnceWithExactly(content))
  t.true(
    orator._parseParamsForCommand.calledOnceWithExactly([ content ], msg, bot)
  )
  t.false(orator._tryToExecute.called)
})

test('processMessage/command throws an error', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_isBotMessage').callsFake(() => false)
  const context = 1
  sinon.stub(orator, '_parseParamsForCommand').callsFake(async () => context)
  sinon.spy(orator, '_cleanParams')
  const error = Error('broke')
  sinon.stub(orator, '_tryToExecute').callsFake(async () => {
    throw error
  })
  const bot = new DataClient()
  const content = 'hehe'
  const msg = buildMessage({ content })

  /* const res = */ await orator.processMessage(bot, msg)

  // t.is(res[res.length - 1], chalk.red(`error processing message: ${error}`))
  t.true(orator._cleanParams.calledOnceWithExactly(content))
  t.true(
    orator._parseParamsForCommand.calledOnceWithExactly([ content ], msg, bot)
  )
  t.true(orator._tryToExecute.calledOnceWithExactly(context))
})

test('processMessage/response throws an error', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_isBotMessage').callsFake(() => false)
  const context = 1
  sinon.stub(orator, '_parseParamsForCommand').callsFake(async () => context)
  sinon.spy(orator, '_cleanParams')
  const response = 'yeet'
  sinon.stub(orator, '_tryToExecute').callsFake(async () => response)
  const error = Error('broke')
  sinon.stub(orator, '_processCommandResponse').callsFake(async () => {
    throw error
  })

  const bot = new DataClient()
  const content = 'hehe'
  const msg = buildMessage({ content })

  /* const res = */ await orator.processMessage(bot, msg)

  // t.is(
  //   res[res.length - 1],
  //   chalk.red(`error processing command response: ${error}`)
  // )
  t.true(orator._cleanParams.calledOnceWithExactly(content))
  t.true(
    orator._parseParamsForCommand.calledOnceWithExactly([ content ], msg, bot)
  )
  t.true(orator._tryToExecute.calledOnceWithExactly(context))
  t.true(
    orator._processCommandResponse.calledOnceWithExactly(context, response)
  )
})

test('processMessage/happy path', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_isBotMessage').callsFake(() => false)
  const context = 1
  sinon.stub(orator, '_parseParamsForCommand').callsFake(async () => context)
  sinon.spy(orator, '_cleanParams')
  const response = 'yeet'
  sinon.stub(orator, '_tryToExecute').callsFake(async () => response)
  const result = 'cool'
  sinon.stub(orator, '_processCommandResponse').callsFake(async () => result)

  const bot = new DataClient()
  const content = 'hehe'
  const msg = buildMessage({ content })

  const res = await orator.processMessage(bot, msg)

  t.is(res, result)
  t.true(orator._cleanParams.calledOnceWithExactly(content))
  t.true(
    orator._parseParamsForCommand.calledOnceWithExactly([ content ], msg, bot)
  )
  t.true(orator._tryToExecute.calledOnceWithExactly(context))
  t.true(
    orator._processCommandResponse.calledOnceWithExactly(context, response)
  )
})

test('_parseParamsForCommand/sends help message on bot mention', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_sendHelp')
  const msg = buildMessage()
  const bot = new DataClient()
  const prefix = '0'
  sinon.stub(bot.dbm, 'newQuery')
    .callsFake(() => ({ get: async () => ({ get: () => prefix }) }))
  bot.user = me
  const params = [ me.id ]

  const res = await orator._parseParamsForCommand(params, msg, bot)

  t.is(res, undefined)
  t.true(orator._sendHelp.calledOnceWithExactly(prefix, msg, bot.user))
})

test('_parseParamsForCommand/bot mention as prefix', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_sendHelp')
  const msg = buildMessage()
  const bot = new DataClient()
  sinon.stub(bot.dbm, 'newQuery')
    .callsFake(() => ({ get: async () => ({ get: () => null }) }))
  sinon.stub(bot, 'findCommand')
  bot.user = me
  const params = [ me.id, 'yeetus' ]

  const res = await orator._parseParamsForCommand(params, msg, bot)

  t.is(res, undefined)
  t.true(
    bot.findCommand.calledOnceWithExactly('yeetus')
  )
})

test('_parseParamsForCommand/bot mention as prefix with command', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_sendHelp')
  const msg = buildMessage()
  const bot = new DataClient()
  sinon.stub(bot.dbm, 'newQuery')
    .callsFake(() => ({ get: async () => ({ get: () => null }) }))
  sinon.stub(bot, 'findCommand')
  bot.user = me
  const params = [ me.id + 'yeetus' ]

  const res = await orator._parseParamsForCommand(params, msg, bot)

  t.is(res, undefined)
  t.true(
    bot.findCommand.calledOnceWithExactly('yeetus')
  )
})

test('_parseParamsForCommand/prefix with space before command', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_sendHelp')
  const msg = buildMessage()
  const bot = new DataClient()
  sinon.stub(bot.dbm, 'newQuery')
    .callsFake(() => ({ get: async () => ({ get: () => null }) }))
  sinon.stub(bot, 'findCommand')
  bot.user = me
  const cmd = 'whee'
  const params = [ orator.defaultPrefix, cmd ]

  const res = await orator._parseParamsForCommand(params, msg, bot)

  t.is(res, undefined)
  t.true(
    bot.findCommand.calledOnceWithExactly(cmd)
  )
})

test('_parseParamsForCommand/no command', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_sendHelp')
  const msg = buildMessage()
  const bot = new DataClient()
  sinon.stub(bot.dbm, 'newQuery')
    .callsFake(() => ({ get: async () => ({ get: () => null }) }))
  sinon.stub(bot, 'findCommand')
  bot.user = me
  const cmd = 'whee'
  const params = [ cmd ]

  const res = await orator._parseParamsForCommand(params, msg, bot)

  t.is(res, undefined)
  t.true(
    bot.findCommand.calledOnceWithExactly(undefined)
  )
})

test('_parseParamsForCommand/happy path', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_sendHelp')
  const msg = buildMessage()
  const bot = new DataClient()
  sinon.stub(bot.dbm, 'newQuery')
    .callsFake(() => ({ get: async () => ({ get: () => null }) }))
  const command = { test: 'stuff' }
  sinon.stub(bot, 'findCommand').callsFake(() => command)
  bot.user = me
  const cmd = 'whee'
  const params = [ orator.defaultPrefix + cmd ]

  const res = await orator._parseParamsForCommand(params, msg, bot)

  t.deepEqual(res, { command, msg, params })
  t.true(
    bot.findCommand.calledOnceWithExactly(cmd)
  )
})

test('_parseParamsForCommand/happy path/dm message', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_sendHelp')
  const msg = buildMessage({ hasGuild: false })
  const bot = new DataClient()
  sinon.stub(bot.dbm, 'newQuery')
    .callsFake(() => ({ get: async () => ({ get: () => null }) }))
  const command = { test: 'stuff' }
  sinon.stub(bot, 'findCommand').callsFake(() => command)
  bot.user = me
  const cmd = 'whee'
  const params = [ orator.defaultPrefix + cmd ]

  const res = await orator._parseParamsForCommand(params, msg, bot)

  t.deepEqual(res, { command, msg, params })
  t.true(
    bot.findCommand.calledOnceWithExactly(cmd)
  )
})

test('_processCommandResponse/no response', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, 'tryMessageDelete')
  sinon.stub(orator, 'tryDMCreateMessage')
  sinon.stub(orator, 'tryCreateMessage')
  const command = buildCommand({ deleteInvoking: false })
  const bot = new DataClient()
  const msg = buildMessage()

  await orator._processCommandResponse({ bot, msg, command })

  t.false(orator.tryMessageDelete.called)
  t.false(orator.tryCreateMessage.called)
  t.false(orator.tryDMCreateMessage.called)
})

test('_processCommandResponse/string response', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, 'tryMessageDelete')
  sinon.stub(orator, 'tryDMCreateMessage')
  sinon.stub(orator, 'tryCreateMessage')
  const command = buildCommand()
  const bot = new DataClient()
  bot.user = me
  const msg = buildMessage()
  const response = 'response'
  const content = {
    content: response,
    embed: undefined
  }

  await orator._processCommandResponse({ bot, msg, command }, response)

  t.true(orator.tryMessageDelete.calledOnceWithExactly(bot.user, msg))
  t.true(
    orator.tryCreateMessage
      .calledOnceWithExactly(
        bot.user, msg.channel, content, undefined
      )
  )
  t.false(orator.tryDMCreateMessage.called)
})

test('_processCommandResponse/object response/dm', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, 'tryMessageDelete')
  sinon.stub(orator, 'tryDMCreateMessage')
  sinon.stub(orator, 'tryCreateMessage')
  const command = buildCommand()
  const bot = new DataClient()
  bot.user = me
  const msg = buildMessage()
  const response = {
    embed: 'wooo',
    file: 'weeeee',
    dm: true
  }
  const content = {
    content: '',
    embed: response.embed
  }

  await orator._processCommandResponse({ bot, msg, command }, response)

  t.true(orator.tryMessageDelete.calledOnceWithExactly(bot.user, msg))
  t.true(
    orator.tryDMCreateMessage
      .calledOnceWithExactly(
        bot.user, msg, content, response.file
      )
  )
  t.false(orator.tryCreateMessage.called)
})

test('_processCommandResponse/deletes response', async (t) => {
  const clock = sinon.useFakeTimers()
  const orator = buildOrator()
  sinon.stub(orator, 'tryMessageDelete')
  sinon.stub(orator, 'tryDMCreateMessage')
  sinon.stub(orator, 'tryCreateMessage').callsFake(async () => true)
  const command = buildCommand({ deleteInvoking: false })
  const bot = new DataClient()
  bot.user = me
  const msg = buildMessage()
  const response = 'response'
  const content = {
    content: response,
    embed: undefined
  }

  await orator._processCommandResponse({ bot, msg, command }, response)
  clock.tick(orator.deleteResponseDelay)

  t.true(orator.tryMessageDelete.calledOnceWithExactly(bot.user, true))
  t.true(
    orator.tryCreateMessage
      .calledOnceWithExactly(
        bot.user, msg.channel, content, undefined
      )
  )
  t.false(orator.tryDMCreateMessage.called)
})

test('hasPermission/command with no permission', async (t) => {
  const orator = buildOrator()
  const command = buildCommand()

  t.true(await orator.hasPermission({ command }))
})

test('hasPermission/has exact permission', async (t) => {
  const orator = buildOrator()
  const permission = {
    level: 59,
    run: () => true
  }
  sinon.spy(permission, 'run')
  orator.permissions = [ permission ]
  const command = buildCommand({ permission })

  t.true(await orator.hasPermission({ command }))
  t.true(permission.run.calledOnce)
})

test('hasPermission/has higher permission', async (t) => {
  const orator = buildOrator()
  const permission = {
    level: 59,
    run: () => false
  }
  sinon.spy(permission, 'run')
  const betterPermission = {
    level: 100,
    run: () => true
  }
  sinon.spy(betterPermission, 'run')
  orator.permissions = [ permission, betterPermission ]
  const command = buildCommand({ permission })

  t.true(await orator.hasPermission({ command }))
  t.true(permission.run.calledOnce)
  t.true(betterPermission.run.calledOnce)
})

test('hasPermission/does not have permission', async (t) => {
  const orator = buildOrator()
  const permission = {
    level: 59,
    run: () => false
  }
  sinon.spy(permission, 'run')
  orator.permissions = [ permission ]
  const command = buildCommand({ permission })

  t.false(await orator.hasPermission({ command }))
  t.true(permission.run.calledOnce)
})

test('_isBotMessage/me', (t) => {
  const orator = buildOrator()
  const message = buildMessage({ userId: me.id })

  t.true(orator._isBotMessage(me, message))
})

test('_isBotMessage/other bot', (t) => {
  const orator = buildOrator()
  const message = buildMessage({ isMessageByBot: true })

  t.true(orator._isBotMessage(me, message))
})

test('_isBotMessage/not a bot', (t) => {
  const orator = buildOrator()
  const message = buildMessage()

  t.false(orator._isBotMessage(me, message))
})

test('_isMentioned/true', (t) => {
  const orator = buildOrator()

  t.true(orator._isMentioned(
    me,
    buildMessage({
      mentions: [ me ]
    })
  ))
})

test('_isMentioned/false', (t) => {
  const orator = buildOrator()

  t.false(orator._isMentioned(
    me,
    buildMessage()
  ))
})

test('_sendHelp', async (t) => {
  const orator = buildOrator()
  sinon.spy(orator, 'tryCreateMessage')
  const msg = buildMessage()
  const prefix = '!'

  await orator._sendHelp(prefix, msg, me)
  t.true(orator.tryCreateMessage.calledOnceWithExactly(
    me,
    msg.channel,
    `Hello! The prefix is \`${prefix}\`, try \`${prefix}help\``
  ))
})

test('_isGuild/true', (t) => {
  const orator = buildOrator()

  t.true(orator._isGuild(buildMessage()))
})

test('_isGuild/false', (t) => {
  const orator = buildOrator()

  t.false(orator._isGuild(buildMessage({ hasGuild: false })))
})

test('_badCommand', async (t) => {
  const orator = buildOrator()
  const msg = buildMessage()
  const issue = 'bad bad'

  t.deepEqual(
    await orator._badCommand(msg, issue),
    {
      content: `${msg.author.mention} ${issue}`,
      badCommand: true
    }
  )
})
