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
  // t.context.DataClient = new DataClient()

  // const permission = new Permission({
  //   name: 'Guild Owner',
  //   level: 80,
  //   check: async (member) => member === null
  // })
  // const command = new Command(t.context.DataClient, {
  //   name: 'test',
  //   description: 'test description',
  //   run: () => console.log('hi'),
  //   options: {
  //     permission: 'Guild Owner'
  //   }
  // })

  // t.context.DataClient.permissions.set(permission.name, permission)
  // t.context.DataClient.commands.set(command.name, command)
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
      mentions: [me]
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
  t.true(helpSpy.calledWith(
    `Hello! The prefix is \`${prefix}\`, try \`${prefix}help\``
  ))
  t.true(helpSpy.calledOnce)
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

  t.true(createMessageSpy.calledWith(`${msg.author.mention} ${issue}`))
  t.true(createMessageSpy.calledOnce)
  t.true(messageDeleteSpy.calledOnce)
})

// test.skip('canExecute', async (t) => {
//   t.is(await t.context.Orator._canExecute(t.context.DataClient, command, ['test'], permission, {
//     member: null
//   }), true)
// })

// test.skip('getCommand', (t) => {
//   t.is(t.context.Orator._getCommand(t.context.DataClient, 'test'), command)
// })

// test.skip('Command by user', (t) => {
//   const msg = {
//     content: '!test',
//     member: {
//       id: 'testing_id'
//     }
//   }
//   const mockClient = {
//     user: {
//       id: 'other_testing_id'
//     }
//   }
//   t.is(t.context.Orator._isCommandByUser(mockClient, msg, '!'), true)
// })

// test.skip('Is guild', (t) => {
//   const msg = {
//     channel: {
//       guild: true
//     }
//   }
//   t.is(t.context.Orator._isGuild(msg), true)
// })

// test.skip('Parse response', (t) => {
//   const resp = {
//     content: null,
//     embed: null,
//     file: null
//   }
//   t.deepEqual(t.context.Orator._parseResponse(resp), {
//     content: {
//       content: '',
//       embed: null
//     },
//     file: null
//   })
// })

// test.serial('Speed logs', async (t) => {
//   t.context.Orator._start = 0
//   t.context.Orator._speedLog('test')
//   t.true(t.context.log.calledOnce)
// })

/* Process Message thingy(That stonic didn't want to do)...
 test.serial('', async t => {
     const message = {
         content: 'test',
         member: null,
         channel: {
             createMessage: (...params) => new Promise((resolve, reject) => {
                if (!params) {
                     reject(new Error('No params'))
                } else {
                  resolve(message)
                }
             })
        }
    }
})
*/
