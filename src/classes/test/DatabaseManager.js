import test from 'ava'
import sinon from 'sinon'
require('dotenv').load()

import DatabaseManager from '../DatabaseManager'
import QueryBuilder from 'simple-knex'
import Logger from '../Logger'

test.before(async (t) => {
  t.context.DatabaseManager = new DatabaseManager(t.context.tables, Logger, QueryBuilder)

  t.context.tables = {
    settings: 'guild_settings',
    toggles: 'guild_toggles'
  }

  for (const key in t.context.tables) {
    const exists = await t.context.DatabaseManager._qb._knex.schema.hasTable(t.context.tables[key])
    if (!exists) {
      await t.context.DatabaseManager._qb._knex.schema.createTable(t.context.tables[key], (table) => {
        table.string('id')
          .defaultTo('1')
        table.string('prefix')
          .defaultTo('!')
      })
    }
  }
})

test.beforeEach((t) => {
  t.context.qbDelete = sinon.spy(t.context.DatabaseManager._qb, 'delete')
  t.context.qbSelect = sinon.spy(t.context.DatabaseManager._qb, 'select')
  t.context.qbUpdate = sinon.spy(t.context.DatabaseManager._qb, 'update')
  t.context.qbGet = sinon.spy(t.context.DatabaseManager._qb, 'get')
  t.context.qbInsert = sinon.spy(t.context.DatabaseManager._qb, 'insert')
  t.context.qbCreateTable = sinon.spy(t.context.DatabaseManager._qb, 'createTable')
})

test.afterEach((t) => {
  t.context.qbDelete.restore()
  t.context.qbSelect.restore()
  t.context.qbUpdate.restore()
  t.context.qbGet.restore()
  t.context.qbInsert.restore()
  t.context.qbCreateTable.restore()
})

test.serial('add client', async (t) => {
  t.is(await t.context.DatabaseManager.addClient('1', '!'), [{ id: '1', prefix: '!' }])
  t.true(t.context.qbInsert.calledTwice)
})

test.serial('add status', async (t) => {
  const exists = await t.context.DatabaseManager._qb._knex.schema.hasTable('statuses')
  if (!exists) {
    await t.context.DatabaseManager._qb._knex.schema.createTable('statuses', (table) => {
      table.string('name')
        .defaultTo('some-name')
      table.integer('type')
        .defaultTo(1)
      table.boolean('default')
        .defaultTo(true)
    })
  }
  t.is(await t.context.DatabaseManager.addStatus('add-stats-name', 1, true), 0)
  t.true(t.context.qbInsert.calledOnce)
})

test.serial('get default settings', async (t) => {
  const value = await t.context.DatabaseManager.getDefaultStatus()
  t.deepEqual(value, { name: 'add-stats-name', type: 1 })
  t.true(t.context.qbGet.calledOnce)
})

test.serial('get settings', async (t) => {
  const value = await t.context.DatabaseManager.getSettings('1')
  t.deepEqual(value, { id: '1', prefix: '!' })
  t.true(t.context.qbGet.calledOnce)
})

test.serial('get stats', async (t) => {
  await t.context.DatabaseManager.getStatuses()
  t.true(t.context.qbGet.calledOnce)
})

test.serial('get toggles', async (t) => {
  const value = await t.context.DatabaseManager.getToggles('1')
  t.deepEqual(value, { id: '1', prefix: '!' })
  t.true(t.context.qbGet.calledOnce)
})

test.serial('remove client', async (t) => {
  t.is(await t.context.DatabaseManager.removeClient('1'), 0)
  t.true(t.context.qbDelete.calledTwice)
})

test.serial('remove status', async (t) => {
  t.is(await t.context.DatabaseManager.removeStatus('add-stats-name'), 0)
  t.true(t.context.qbDelete.calledOnce)
})

test.serial('update default status', async (t) => {
  t.is(await t.context.DatabaseManager.updateDefaultStatus('a-new-status', 0), 0)
  t.true(t.context.qbUpdate.calledOnce)
})

test.serial('update settings', async (t) => {
  t.is(await t.context.DatabaseManager.updateSettings('1', {
    id: '2',
    prefix: '.'
  }), 0)
  t.true(t.context.qbUpdate.calledOnce)
})

test.serial('create tables', async (t) => {
  await t.context.DatabaseManager._createTables({
    'some-table': [
      {
        name: 'id',
        type: 'string',
        primary: true
      }
    ]
  })
  t.true(t.context.qbCreateTable.called)
})
