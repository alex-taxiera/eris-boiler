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
  userId = '456'
} = {}) => ({
  content,
  channel: {
    guild: hasGuild ? { id: '911' } : undefined,
    id: '123',
    createMessage: createMessageFn
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

test('_isCommandByUser/true', async (t) =>
  t.true(t.context.Orator._isCommandByUser(
    me,
    buildMessage({
      content: '!help'
    }),
    '!'
  ))
)

test('_isCommandByUser/false - incorrect prefix', async (t) =>
  t.false(t.context.Orator._isCommandByUser(
    me,
    buildMessage({
      content: '?help'
    }),
    '!'
  ))
)

test('_isCommandByUser/false - is bot', async (t) =>
  t.false(t.context.Orator._isCommandByUser(
    me,
    buildMessage({
      content: '!help',
      isMessageByBot: true
    }),
    '!'
  ))
)

test('_isCommandByUser/false - is self', (t) =>
  t.false(t.context.Orator._isCommandByUser(
    me,
    buildMessage({
      content: '!help',
      userId: me.id
    }),
    '!'
  ))
)

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
  const helpSpy = sinon.spy(msg.channel, 'createMessage')
  await t.context.Orator._sendHelp(prefix, msg)
  t.true(helpSpy.calledOnceWithExactly(
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
  const messageToDelete = {
    delete: async () => null
  }
  const msg = buildMessage({
    createMessageFn: async () => messageToDelete
  })
  const issue = 'bad bad'
  const createMessageSpy = sinon.spy(msg.channel, 'createMessage')
  const messageDeleteSpy = sinon.spy(messageToDelete, 'delete')
  await t.context.Orator._badCommand(msg, issue, 1)

  t.true(
    createMessageSpy.calledOnceWithExactly(`${msg.author.mention} ${issue}`)
  )
  t.true(messageDeleteSpy.calledOnce)
})
