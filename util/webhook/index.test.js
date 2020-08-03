import test from 'ava'
import sinon from 'sinon'

import { findOrCreateManagedWebhook } from '.'

test('findOrCreateManagedWebhook/does nothing if not guild', async (t) => {
  const res = await findOrCreateManagedWebhook({})

  t.is(res, undefined)
})

test('findOrCreateManagedWebhook/finds existing webhook', async (t) => {
  const id = '123'
  const name = 'hello'
  const existingHook = { user: { id }, name }
  const channel = {
    guild: {},
    getWebhooks: async () => ([ { user: {} }, existingHook, { user: {} } ])
  }

  const res = await findOrCreateManagedWebhook(channel, id, name)

  t.deepEqual(res, existingHook)
})

test('findOrCreateManagedWebhook/creates a webhook', async (t) => {
  const id = '123'
  const name = 'hello'
  const existingHook = { user: { id: '456' }, name: 'world' }
  const channel = {
    guild: {},
    getWebhooks: async () => ([ { user: {} }, existingHook, { user: {} } ]),
    createWebhook: sinon.spy()
  }

  await findOrCreateManagedWebhook(channel, id, name)

  t.true(channel.createWebhook.calledOnceWithExactly({ name }))
})
