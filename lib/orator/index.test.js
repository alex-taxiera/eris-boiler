import test from 'ava'
import sinon from 'sinon'

import Orator from '.'
import {
  Command,
  GuildCommand,
  PrivateCommand
} from '../command'
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
} = {}) => {
  const data = {
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
      permission
    }
  }

  return dmOnly
    ? new PrivateCommand(data)
    : guildOnly
      ? new GuildCommand(data)
      : new Command(data)
}

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
  channelWebhook = {},
  isDM = false
} = {}) => ({
  content,
  channel: {
    type: isDM ? 1 : 0,
    guild: hasGuild ? { id: '911' } : undefined,
    id: '123',
    createMessage: createMessageFn,
    permissionsOf: () => channelPerms,
    getWebhooks: async () => ([
      {
        user: me,
        name: 'Webhook Deliverer',
        ...channelWebhook
      }
    ])
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

test('deleteMessage/has manage messages', async (t) => {
  const orator = buildOrator()
  const channelPerms = new Map()
  channelPerms.set('manageMessages', true)
  const message = buildMessage({ channelPerms })
  sinon.spy(message, 'delete')

  await orator.deleteMessage(me, message)
  t.true(message.delete.calledOnce)
})

test('deleteMessage/own message', async (t) => {
  const orator = buildOrator()
  const message = buildMessage({ userId: me.id })
  sinon.spy(message, 'delete')

  await orator.deleteMessage(me, message)
  t.true(message.delete.calledOnce)
})

test('deleteMessage/cannot delete', async (t) => {
  const orator = buildOrator()
  const message = buildMessage()
  sinon.spy(message, 'delete')

  await orator.deleteMessage(me, message)
  t.false(message.delete.calledOnce)
})

test('deleteMessage/can delete someones message', async (t) => {
  const orator = buildOrator()
  const message = buildMessage()
  sinon.spy(message, 'delete')

  await orator.deleteMessage(me, message)
  t.false(message.delete.calledOnce)
})

test('deleteMessage/handles error', async (t) => {
  const orator = buildOrator()
  const message = buildMessage({ userId: me.id })
  const error = new Error('test')
  sinon.stub(message, 'delete')
    .callsFake(async () => {
      throw error
    })

  return orator.deleteMessage(me, message)
    .then((res) => t.is(res, undefined))
})

test('replyToMessage/responds to a guild message', async (t) => {
  const orator = buildOrator()
  const message = buildMessage()
  sinon.stub(orator, 'createMessage')
  const content = 1
  const file = 2

  await orator.replyToMessage(me, message, content, file)
  t.true(
    orator.createMessage
      .calledOnceWithExactly(me, message.channel, content, file)
  )
})

test('replyToMessage/responds to a dm message', async (t) => {
  const orator = buildOrator()
  const message = buildMessage({ isDM: true })
  sinon.stub(orator, 'createDirectMessage')
  const content = 1
  const file = 2

  await orator.replyToMessage(me, message, content, file)
  t.true(
    orator.createDirectMessage.calledOnceWithExactly(me, message, content, file)
  )
})

test('createMessage/has sendMessages', async (t) => {
  const orator = buildOrator()
  const message = buildMessage()
  sinon.spy(message.channel, 'createMessage')
  const contents = [ 1, 2 ]

  await orator.createMessage(me, message.channel, ...contents)
  t.true(message.channel.createMessage.calledOnceWithExactly(...contents))
})

test('createMessage/has no permission', (t) => {
  const orator = buildOrator()
  const channelPerms = new Map()
  const message = buildMessage({ channelPerms })
  sinon.spy(message.channel, 'createMessage')
  const contents = [ 1, 2 ]

  const res = orator.createMessage(me, message.channel, ...contents)

  t.is(res, undefined)
  t.false(message.channel.createMessage.calledOnce)
})

test('createMessage/handles error', (t) => {
  const orator = buildOrator()
  const message = buildMessage()
  const error = new Error('test')
  sinon.stub(message.channel, 'createMessage')
    .callsFake(async () => {
      throw error
    })
  const contents = [ 1, 2 ]

  return orator.createMessage(me, message.channel, ...contents)
    .then((res) => t.is(res, undefined))
})

test('createDirectMessage/can DM user', async (t) => {
  const orator = buildOrator()
  const message = buildMessage()
  sinon.spy(message.author.dmChannel, 'createMessage')
  sinon.stub(orator, 'createMessage').callsFake(async () => null)
  const contents = [ 1, 2 ]

  await orator.createDirectMessage(me, message, ...contents)
  t.true(
    message.author.dmChannel.createMessage.calledOnceWithExactly(...contents)
  )
  t.true(
    orator.createMessage
      .calledOnceWithExactly(me, message.channel, 'DM sent.', undefined)
  )
})

test('createDirectMessage/getDMChannel Error', async (t) => {
  const orator = buildOrator()
  const message = buildMessage()
  sinon.stub(message.author, 'getDMChannel').callsFake(async () => {
    throw new Error('bad guy')
  })
  sinon.stub(orator, 'createMessage').callsFake(async () => null)
  const contents = [ 1, 2 ]

  await orator.createDirectMessage(me, message, ...contents)
  t.true(
    orator.createMessage
      .calledOnceWithExactly(me, message.channel, ...contents)
  )
})

test('createDirectMessage/dm.createMessage Error', async (t) => {
  const orator = buildOrator()
  const message = buildMessage()
  sinon.stub(message.author.dmChannel, 'createMessage').callsFake(async () => {
    throw new Error('bad guy')
  })
  sinon.stub(orator, 'createMessage').callsFake(async () => null)
  const contents = [ 1, 2 ]

  await orator.createDirectMessage(me, message, ...contents)
  t.true(
    orator.createMessage
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

  const res = orator._checkSubCommand(bot, { params, msg, command })

  t.deepEqual(
    res,
    {
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

  const res = orator._checkSubCommand(bot, { msg, command, params })

  t.is(res, undefined)
})

test('_cleanParams/splits params by space', (t) => {
  const orator = buildOrator()
  const content = 'THIS     IS     A TEST'

  t.deepEqual(orator._cleanParams(content), content.split(/\s+/))
})

test('_cleanParams/cleans up mentions', (t) => {
  const orator = buildOrator()
  const ids = [ '1', '2', '3', '4' ]
  const content = `<@${ids[0]}> <@!${ids[1]}> <#${ids[2]}> <#&${ids[3]}>`

  t.deepEqual(
    orator._cleanParams(content),
    ids
  )
})

test('hasPermission/guild command in dm', async (t) => {
  const orator = buildOrator()
  const bot = new DataClient()
  const command = buildCommand({ guildOnly: true })
  const params = [ 1 ]
  const msg = buildMessage({ hasGuild: false })

  const { ok } = await orator.hasPermission(bot, { command, msg, params })
  t.false(ok)
})

test('hasPermission/dm command in guild', async (t) => {
  const orator = buildOrator()
  const bot = new DataClient()
  const command = buildCommand({ dmOnly: true })
  const params = [ 1 ]
  const msg = buildMessage()

  const { ok } = await orator.hasPermission(bot, { command, msg, params })
  t.false(ok)
})

test('_tryToExecute/uses badCommand on not enough params', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_badCommand')
  const bot = new DataClient()
  const command = buildCommand({ parameters: [ 1, 2, 3 ] })
  const params = [ 1 ]
  const msg = buildMessage()
  const context = { command, msg, params }

  await orator._tryToExecute(bot, context)
  t.true(
    orator._badCommand.calledOnceWithExactly(
      context,
      'insufficient parameters!'
    )
  )
})

test('_tryToExecute/uses badCommand on no permission', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_badCommand')
  const response = 'borked'
  sinon.stub(orator, 'hasPermission')
    .callsFake(() => ({ ok: false, message: response }))
  const bot = new DataClient()
  const command = buildCommand({ parameters: [ 1 ] })
  const params = [ 1 ]
  const msg = buildMessage()
  const context = { command, msg, params }

  await orator._tryToExecute(bot, context)
  t.true(orator._badCommand.calledOnceWithExactly(context, response))
})

test('hasPermission/not ok uses custom permission message', async (t) => {
  const orator = buildOrator()
  const bot = new DataClient()
  const customMsg = 'woooohoooo'
  const command = buildCommand({
    permission: { reason: customMsg, run: () => false }
  })

  const msg = buildMessage()

  const { ok, message } = await orator.hasPermission(bot, { command, msg })
  t.false(ok)
  t.is(message, customMsg)
})

test('_tryToExecute/recursion when subcommand is found', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_badCommand')
  sinon.spy(orator, '_tryToExecute')
  sinon.stub(orator, 'hasPermission').callsFake(() => ({ ok: true }))
  const bot = new DataClient()
  const command = buildCommand({ parameters: [ 1 ] })
  const subCommand = buildCommand({ parameters: [ 1, 2, 3 ] })
  const params = [ 1 ]
  const msg = buildMessage()
  const subContext = { params: [], command: subCommand, msg }
  sinon.stub(orator, '_checkSubCommand')
  orator._checkSubCommand
    .onCall(0).returns(subContext)

  await orator._tryToExecute(bot, { command, msg, params })
  t.true(orator._tryToExecute.calledTwice)
  t.deepEqual(
    orator._tryToExecute.getCall(1).args,
    [ bot, subContext ]
  )
})

test('_tryToExecute/call middleware and return run', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_badCommand')
  sinon.spy(orator, '_tryToExecute')
  sinon.stub(orator, 'hasPermission').callsFake(() => ({ ok: true }))
  sinon.stub(orator, '_checkSubCommand').callsFake(() => false)
  const bot = new DataClient()
  const command = buildCommand({
    parameters: [ 1 ],
    middleware: [ { run: () => null } ]
  })
  sinon.spy(command.middleware[0], 'run')
  sinon.spy(command, 'run')
  const params = [ 1 ]
  const msg = buildMessage()

  await orator._tryToExecute(bot, { command, msg, params })
  t.true(command.run.calledOnceWithExactly(bot, { command, msg, params }))
  t.true(
    command.middleware[0].run
      .calledOnceWithExactly(bot, { command, msg, params })
  )
})

test('processMessage/ignore bots', async (t) => {
  const orator = buildOrator()
  const msg = buildMessage()
  sinon.stub(orator, '_isBotMessage').callsFake(() => true)
  sinon.spy(orator, '_tryToExecute')
  const bot = new DataClient()

  const res = await orator.processMessage(bot, msg)

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
  const error = new Error('testing')
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
  t.true(orator._tryToExecute.calledOnceWithExactly(bot, context))
})

test('processMessage/response throws an error', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_isBotMessage').callsFake(() => false)
  const context = 1
  sinon.stub(orator, '_parseParamsForCommand').callsFake(async () => context)
  sinon.spy(orator, '_cleanParams')
  const response = 'yeet'
  sinon.stub(orator, '_tryToExecute')
    .callsFake(async () => ({ context, response }))
  const error = new Error('testing')
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
  t.true(orator._tryToExecute.calledOnceWithExactly(bot, context))
  t.true(
    orator._processCommandResponse.calledOnceWithExactly(bot, context, response)
  )
})

test('processMessage/happy path', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_isBotMessage').callsFake(() => false)
  const context = 1
  sinon.stub(orator, '_parseParamsForCommand').callsFake(async () => context)
  sinon.spy(orator, '_cleanParams')
  const response = 'yeet'
  sinon.stub(orator, '_tryToExecute')
    .callsFake(async () => ({ context, response }))
  sinon.stub(orator, '_processCommandResponse')

  const bot = new DataClient()
  const content = 'hehe'
  const msg = buildMessage({ content })

  await orator.processMessage(bot, msg)

  t.true(orator._cleanParams.calledOnceWithExactly(content))
  t.true(
    orator._parseParamsForCommand.calledOnceWithExactly([ content ], msg, bot)
  )
  t.true(orator._tryToExecute.calledOnceWithExactly(bot, context))
  t.true(
    orator._processCommandResponse.calledOnceWithExactly(bot, context, response)
  )
})

test('processMessage/no stubs', async (t) => {
  const orator = buildOrator()

  const response = 'yeet'
  const name = 'namey'
  const command = buildCommand({ name, run: () => response })
  const bot = new DataClient()
  bot.user = me
  bot.commands.set(name, command)
  const content = orator.defaultPrefix + name
  const msg = buildMessage({ content })
  sinon.stub(msg.channel, 'createMessage').callsFake(async () => null)

  await orator.processMessage(bot, msg)

  t.true(msg.channel.createMessage.calledOnceWithExactly(
    { content: response, embed: undefined },
    undefined
  ))
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

  t.deepEqual(res, { command, msg, params, channel: msg.channel })
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

  t.deepEqual(res, { command, msg, params, channel: msg.channel })
  t.true(
    bot.findCommand.calledOnceWithExactly(cmd)
  )
})

test('_processCommandResponse/no response', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, 'deleteMessage')
  sinon.stub(orator, 'createDirectMessage')
  sinon.stub(orator, 'replyToMessage')
  const command = buildCommand({ deleteInvoking: false })
  const bot = new DataClient()
  const msg = buildMessage()

  await orator._processCommandResponse(bot, { msg, command })

  t.false(orator.deleteMessage.called)
  t.false(orator.replyToMessage.called)
  t.false(orator.createDirectMessage.called)
})

test('_processCommandResponse/string response', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, 'deleteMessage')
  sinon.stub(orator, 'createDirectMessage')
  sinon.stub(orator, 'replyToMessage')
  const command = buildCommand()
  const bot = new DataClient()
  bot.user = me
  const msg = buildMessage()
  const response = 'response'
  const content = {
    content: response,
    embed: undefined
  }

  await orator._processCommandResponse(bot, { msg, command }, response)

  t.true(orator.deleteMessage.calledOnceWithExactly(bot.user, msg))
  t.true(
    orator.replyToMessage
      .calledOnceWithExactly(
        bot.user, msg, content, undefined
      )
  )
  t.false(orator.createDirectMessage.called)
})

test('_processCommandResponse/webhook response', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_replyOrDirect')
  const command = buildCommand()
  const bot = new DataClient()
  sinon.stub(bot, 'executeWebhook')
  bot.user = me
  const hook = {
    id: '1',
    token: '2'
  }
  const msg = buildMessage({
    channelWebhook: hook
  })
  const response = {
    content: 'abc',
    webhook: true
  }
  const content = {
    content: response.content,
    embed: response.embed
  }

  await orator._processCommandResponse(bot, { msg, command }, response)

  t.true(bot.executeWebhook.calledOnceWithExactly(hook.id, hook.token, {
    ...content,
    username: undefined,
    avatarURL: undefined,
    wait: true
  }))
  t.true(orator._replyOrDirect.called)
})

test('_processCommandResponse/object response/dm', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, 'deleteMessage')
  sinon.stub(orator, 'createDirectMessage')
  sinon.stub(orator, 'replyToMessage')
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

  await orator._processCommandResponse(bot, { msg, command }, response)

  t.true(orator.deleteMessage.calledOnceWithExactly(bot.user, msg))
  t.true(
    orator.createDirectMessage
      .calledOnceWithExactly(
        bot.user, msg, content, response.file
      )
  )
  t.false(orator.replyToMessage.called)
})

test('_processCommandResponse/object response/dm command', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, 'deleteMessage')
  sinon.stub(orator, 'createDirectMessage')
  sinon.stub(orator, 'replyToMessage')
  const response = {
    embed: 'wooo',
    file: 'weeeee'
  }
  const command = buildCommand({ dmOnly: true, run: () => response })
  const bot = new DataClient()
  bot.user = me
  const msg = buildMessage()
  const content = {
    content: '',
    embed: response.embed
  }

  const res = await command.run({ msg, command })
  await orator._processCommandResponse(bot, { msg, command }, res)

  t.true(orator.deleteMessage.calledOnceWithExactly(bot.user, msg))
  t.true(
    orator.createDirectMessage
      .calledOnceWithExactly(
        bot.user, msg, content, response.file
      )
  )
  t.false(orator.replyToMessage.called)
})

test('_processCommandResponse/deletes response', async (t) => {
  const clock = sinon.useFakeTimers()
  const orator = buildOrator()
  sinon.stub(orator, 'deleteMessage')
  sinon.stub(orator, 'createDirectMessage')
  sinon.stub(orator, 'replyToMessage').callsFake(async () => true)
  const command = buildCommand({ deleteInvoking: false })
  const bot = new DataClient()
  bot.user = me
  const msg = buildMessage()
  const response = 'response'
  const content = {
    content: response,
    embed: undefined
  }

  await orator._processCommandResponse(bot, { msg, command }, response)
  clock.tick(orator.deleteResponseDelay)

  t.true(orator.deleteMessage.calledOnceWithExactly(bot.user, true))
  t.true(
    orator.replyToMessage
      .calledOnceWithExactly(
        bot.user, msg, content, undefined
      )
  )
  t.false(orator.createDirectMessage.called)
})

test('_processCommandResponse/missing webhook permissions', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, '_replyOrDirect')
  sinon.stub(orator, 'createMessage').callsFake(async () => true)
  const error = 'This command requires the "Manage Webhooks" permission!'
  const response = {
    content: error,
    webhook: true
  }
  const command = buildCommand()
  const bot = new DataClient()
  sinon.stub(bot, 'executeWebhook').rejects(new Error('Missing Permissions'))
  bot.user = me
  const msg = buildMessage()

  await orator._processCommandResponse(bot, { msg, command }, response)

  t.true(
    orator
      ._replyOrDirect
      .calledOnceWithExactly(response, bot, msg, error)
  )
})

test('_processCommandResponse/non-dmOnly command used in DM', async (t) => {
  const orator = buildOrator()
  sinon.stub(orator, 'replyToMessage')
  sinon.stub(orator, 'createDirectMessage')
  sinon.stub(orator, 'createMessage').callsFake(async () => true)
  const content = {
    content: 'loli-girls.exe',
    embed: undefined
  }
  const response = {
    content: content.content,
    dm: false
  }
  const command = buildCommand()
  const bot = new DataClient()
  bot.user = me
  const msg = buildMessage({
    isDM: true
  })

  await orator._processCommandResponse(bot, { msg, command }, response)

  t.true(
    orator
      .replyToMessage
      .calledOnceWithExactly(bot.user, msg, content, undefined)
  )
  t.false(orator.createMessage.called)
})

test('hasPermission/command with no permission', async (t) => {
  const bot = new DataClient()
  const orator = buildOrator()
  const command = buildCommand()

  const { ok } = await orator.hasPermission(bot, { command })
  t.true(ok)
})

test('hasPermission/has exact permission', async (t) => {
  const bot = new DataClient()
  const orator = buildOrator()
  const permission = {
    level: 59,
    run: () => true
  }
  sinon.spy(permission, 'run')
  orator.permissions = [ permission ]
  const command = buildCommand({ permission })

  const { ok } = await orator.hasPermission(bot, { command })
  t.true(ok)
  t.true(permission.run.calledOnce)
})

test('hasPermission/has higher permission', async (t) => {
  const bot = new DataClient()
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

  const { ok } = await orator.hasPermission(bot, { command })
  t.true(ok)
  t.true(permission.run.calledOnce)
  t.true(betterPermission.run.calledOnce)
})

test('hasPermission/does not have permission', async (t) => {
  const bot = new DataClient()
  const orator = buildOrator()
  const permission = {
    level: 59,
    run: () => false
  }
  sinon.spy(permission, 'run')
  orator.permissions = [ permission ]
  const command = buildCommand({ permission })

  const { ok } = await orator.hasPermission(bot, { command })
  t.false(ok)
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

test('_sendHelp', async (t) => {
  const orator = buildOrator()
  sinon.spy(orator, 'replyToMessage')
  const msg = buildMessage()
  const prefix = '!'

  await orator._sendHelp(prefix, msg, me)
  t.true(orator.replyToMessage.calledOnceWithExactly(
    me,
    msg,
    `Hello! The prefix is \`${prefix}\`, try \`${prefix}help\``
  ))
})

test('_badCommand', async (t) => {
  const orator = buildOrator()
  const msg = buildMessage()
  const issue = 'bad bad'
  const context = { msg, command: { dmOnly: false } }

  t.deepEqual(
    await orator._badCommand(context, issue),
    {
      context: context,
      response: {
        content: `${msg.author.mention} ${issue}`,
        badCommand: true,
        dm: context.msg.channel.type !== 0
      }
    }
  )
})
