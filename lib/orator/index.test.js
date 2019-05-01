import test from 'ava'
import sinon from 'sinon'
import dotenv from 'dotenv'

import Orator from './'

dotenv.config()

const me = {
  id: 'botId'
}

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
