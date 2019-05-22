import test from 'ava'
import sinon from 'sinon'

import Orator from './'

const me = {
  id: 'botId'
}

const buildCommand = ({
  name = '',
  description = '',
  parameters = [],
  middleware = [],
  aliases = [],
  subCommands = [],
  run = () => null
}) => ({
  name,
  description,
  parameters,
  middleware,
  aliases,
  subCommands,
  run
})

const buildMessage = ({
  content = '',
  mentions = [],
  deleteFn = async () => null,
  createMessageFn = async () => null,
  hasGuild = true,
  isMessageByBot = false,
  userId = '456',
  channelPerms = new Map()
} = {}) => ({
  content,
  channel: {
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
    bot: isMessageByBot
  },
  mentions,
  delete: deleteFn
})

test.before((t) => {
  t.context.Orator = new Orator()
})

test('_isMentioned/true', (t) =>
  t.true(t.context.Orator._isMentioned(
    me,
    buildMessage({
      mentions: [ me ]
    })
  ))
)

test('_isMentioned/false', (t) =>
  t.false(t.context.Orator._isMentioned(
    me,
    buildMessage()
  ))
)

test('_sendHelp', async (t) => {
  const msg = buildMessage()
  const prefix = '!'
  const tryCreateMessageSpy = sinon.spy(t.context.Orator, 'tryCreateMessage')
  await t.context.Orator._sendHelp(prefix, msg, me)
  t.true(tryCreateMessageSpy.calledOnceWithExactly(
    me,
    msg.channel,
    `Hello! The prefix is \`${prefix}\`, try \`${prefix}help\``
  ))
})

test('_isGuild/true', (t) =>
  t.true(t.context.Orator._isGuild(buildMessage()))
)

test('_isGuild/false', (t) =>
  t.false(t.context.Orator._isGuild(buildMessage({ hasGuild: false })))
)

test('_badCommand', async (t) => {
  const msg = buildMessage()
  const issue = 'bad bad'

  t.deepEqual(
    await t.context.Orator._badCommand(msg, issue),
    {
      content: `${msg.author.mention} ${issue}`,
      badCommand: true
    }
  )
})

test('_tryToExecute/sends bad command on failing middleware', async (t) => {
  const mw = { run: () => false, reason: 'test' }
  const context = {
    params: [],
    command: buildCommand({
      middleware: [ mw ]
    }),
    msg: buildMessage()
  }
  t.deepEqual(
    await t.context.Orator._tryToExecute(context),
    {
      content: `${context.msg.author.mention} ${mw.reason}`,
      badCommand: true
    }
  )
})
