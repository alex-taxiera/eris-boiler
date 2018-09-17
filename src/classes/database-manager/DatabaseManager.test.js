import test from 'ava'
import sinon from 'sinon'

import QueryBuilder from 'simple-knex'

import {
  DatabaseManager,
  Logger
} from '../'

require('dotenv').load()

test.before(async (t) => {
  t.context.tables = {
    settings: 'guild_settings',
    toggles: 'guild_toggles',
    statuses: 'statuses'
  }

  t.context.DatabaseManager = new DatabaseManager(null, Logger, QueryBuilder)

  t.context.DatabaseManager._qb._knex.schema.createTable('guild_settings', (table) => {
    table.string('id')
    table.string('vip')
    table.string('prefix')
      .defaultTo('!')
  }).then(() => {
    t.context.DatabaseManager._qb._knex.schema.createTable('guild_toggles', (table) => {
      table.string('id')
    }).then(() => {
      t.context.DatabaseManager._qb._knex.schema.createTable('statuses', (table) => {
        table.string('name')
        table.boolean('default')
        table.integer('type')
      }).then()
    })
  })
})

test.after.always(async (t) => {
  await t.context.DatabaseManager._qb._knex.schema.dropTable('guild_settings')
  await t.context.DatabaseManager._qb._knex.schema.dropTable('guild_toggles')
  await t.context.DatabaseManager._qb._knex.schema.dropTable('statuses')
})

test.beforeEach((t) => {
  t.context.get = sinon.spy(t.context.DatabaseManager._qb, 'get')
  t.context.delete = sinon.spy(t.context.DatabaseManager._qb, 'delete')
  t.context.select = sinon.spy(t.context.DatabaseManager._qb, 'select')
  t.context.update = sinon.spy(t.context.DatabaseManager._qb, 'update')
  t.context.insert = sinon.spy(t.context.DatabaseManager._qb, 'insert')
  t.context.createTable = sinon.spy(t.context.DatabaseManager._qb, 'createTable')
})

test.afterEach.always((t) => {
  t.context.get.restore()
  t.context.delete.restore()
  t.context.select.restore()
  t.context.update.restore()
  t.context.insert.restore()
  t.context.createTable.restore()
})

test.serial('add client', async (t) => {
  const addedClient = await t.context.DatabaseManager.addClient('1', '!')
  t.truthy(addedClient.every(({ id, prefix }) => id))
  t.true(t.context.insert.calledTwice)
})

test.serial('add status', async (t) => {
  const exists = await t.context.DatabaseManager._qb._knex.schema.hasTable('statuses')
  if (!exists) {
    await t.context.DatabaseManager._qb._knex.schema.createTable('statuses', (table) => {
      table.string('name')
        .defaultTo('a-new-status')
      table.integer('type')
        .defaultTo(0)
      table.boolean('default')
        .defaultTo(true)
    })
  }

  const addedStatus = await t.context.DatabaseManager.addStatus('a-new-status', 0, true)
  t.truthy(addedStatus.every(obj => (obj.name === 'a-new-status' && obj.type === 0 && obj.default === 1)))
  t.true(t.context.insert.calledOnce)
})

test.serial('get default status', async (t) => {
  const defaultStatus = JSON.stringify(await t.context.DatabaseManager.getDefaultStatus())
  t.deepEqual(defaultStatus, JSON.stringify({ name: 'a-new-status', type: 0 }))
  t.true(t.context.get.calledOnce)
})

test.serial('get settings', async (t) => {
  const tSetting = { id: '1', vip: null, prefix: '!' }
  const settings = await t.context.DatabaseManager.getSettings('1')
  t.deepEqual(JSON.stringify(settings), JSON.stringify(tSetting))
  t.true(t.context.get.calledOnce)
})

test.serial('get statuses', async (t) => {
  const statuses = await t.context.DatabaseManager.getStatuses()
  t.truthy(statuses.every(obj => (obj.hasOwnProperty('name') && obj.hasOwnProperty('type'))))
  t.true(t.context.select.calledOnce)
})

test.serial('get toggles', async (t) => {
  const tToggles = { id: '1' }
  const toggles = await t.context.DatabaseManager.getToggles('1')
  t.deepEqual(JSON.stringify(toggles), JSON.stringify(tToggles))
  t.true(t.context.get.calledOnce)
})

test.todo('initialize')

test.serial('update settings', async (t) => {
  const updatedSettings = await t.context.DatabaseManager.updateSettings('1', { prefix: '.' })
  t.true(updatedSettings.find((row) => row.id === '1').prefix === '.')
  t.true(t.context.update.calledOnce)
})

test.serial('remove client', async (t) => {
  const updatedTable = await t.context.DatabaseManager.removeClient('1')
  t.true(Array.isArray(updatedTable) ? updatedTable.every((row) => row.id !== '1') : updatedTable === undefined)
  t.true(t.context.delete.calledTwice)
})

test.serial('remove status', async (t) => {
  await t.context.DatabaseManager.addStatus('delete-status', 1, false)
  const removedStatus = await t.context.DatabaseManager.removeStatus('delete-status')
  t.falsy(removedStatus.find(obj => obj.name === 'delete-status'))
  t.true(t.context.delete.calledOnce)
})

test.serial('update default status', async (t) => {
  const updatedDefStatus = await t.context.DatabaseManager.updateDefaultStatus('a-new-status', 0)
  t.truthy(updatedDefStatus.some(obj => (obj.name === 'a-new-status' && obj.type === 0)))
  t.true(t.context.update.calledOnce)
})

test.serial('create tables', async (t) => {
  const exists = await t.context.DatabaseManager._qb._knex.schema.hasTable('some-table')
  if (exists) await t.context.DatabaseManager._qb._knex.schema.dropTable('some-table')
  await t.context.DatabaseManager._createTables({
    'some-table': [
      {
        name: 'anime',
        type: 'string',
        primary: true
      }
    ]
  })

  let createdTable = await t.context.DatabaseManager._qb.insert({ table: 'some-table', data: { anime: 'Another' } })
  t.truthy(createdTable.every(obj => obj.anime === 'Another'))
  t.true(t.context.createTable.called)
})
