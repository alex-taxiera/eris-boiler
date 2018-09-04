import test from 'ava'
import sinon from 'sinon'

import DatabaseManager from '../DatabaseManager'
import QueryBuilder from 'simple-knex'
import Logger from '../Logger'
require('dotenv').load()

test.before(async (t) => {
  t.context.tables = {
    settings: 'guild_settings',
    toggles: 'guild_toggles'
  }

  t.context.DatabaseManager = new DatabaseManager(t.context.tables, Logger, QueryBuilder)

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
  t.context.get = sinon.spy(t.context.DatabaseManager._qb, 'get')
  t.context.delete = sinon.spy(t.context.DatabaseManager._qb, 'delete')
  t.context.select = sinon.spy(t.context.DatabaseManager._qb, 'select')
  t.context.update = sinon.spy(t.context.DatabaseManager._qb, 'update')
  t.context.insert = sinon.spy(t.context.DatabaseManager._qb, 'insert')
  t.context.createTable = sinon.spy(t.context.DatabaseManager._qb, 'createTable')
})

test.afterEach((t) => {
  t.context.get.restore()
  t.context.delete.restore()
  t.context.select.restore()
  t.context.update.restore()
  t.context.insert.restore()
  t.context.createTable.restore()
})

test.serial('add client', async (t) => {
  const addedClient = await t.context.DatabaseManager.addClient('1', '!')
  t.truthy(addedClient.every(({ id, prefix }) => (id && prefix)))
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
  t.truthy(addedStatus.every(obj => (obj.name === 'a-new-status' && obj.type === 0 && obj.default === true)))
  t.true(t.context.insert.calledOnce)
})

test.serial('get default status', async (t) => {
  const defaultStatus = JSON.stringify(await t.context.DatabaseManager.getDefaultStatus())
  t.deepEqual(defaultStatus, JSON.stringify({ name: 'a-new-status', type: 0 }))
  t.true(t.context.get.calledOnce)
})

test.serial('get settings', async (t) => {
  const settings = await t.context.DatabaseManager.getSettings('1')
  const tSetting = { id: '1', prefix: '!' }
  t.deepEqual(JSON.stringify(settings), JSON.stringify(tSetting))
  t.true(t.context.get.calledOnce)
})

test.serial('get statuses', async (t) => {
  const statuses = await t.context.DatabaseManager.getStatuses()
  t.truthy(statuses.every(obj => (obj.hasOwnProperty('name') && obj.hasOwnProperty('type'))))
  t.true(t.context.select.calledOnce)
})

test.serial('get toggles', async (t) => {
  const tToggles = { id: '1', prefix: '!' }
  const toggles = await t.context.DatabaseManager.getToggles('1')
  t.deepEqual(JSON.stringify(toggles), JSON.stringify(tToggles))
  t.true(t.context.get.calledOnce)
})

// test.before(async (t) => {
//   t.context.DatabaseManager = new DatabaseManager(t.context.tables, Logger, QueryBuilder)

//   t.context.tables = {
//     settings: 'guild_settings',
//     toggles: 'guild_toggles'
//   }

//   for (const key in t.context.tables) {
//     const exists = await t.context.DatabaseManager._qb._knex.schema.hasTable(t.context.tables[key])
//     if (!exists) {
//       await t.context.DatabaseManager._qb._knex.schema.createTable(t.context.tables[key], (table) => {
//         table.string('id')
//           .defaultTo('1')
//         table.string('prefix')
//           .defaultTo('!')
//       })
//     }
//   }

//   t.context.qbGet = sinon.spy(t.context.DatabaseManager._qb, 'get')
//   t.context.qbDelete = sinon.spy(t.context.DatabaseManager._qb, 'delete')
//   t.context.qbSelect = sinon.spy(t.context.DatabaseManager._qb, 'select')
//   t.context.qbUpdate = sinon.spy(t.context.DatabaseManager._qb, 'update')
//   t.context.qbInsert = sinon.spy(t.context.DatabaseManager._qb, 'insert')
//   t.context.qbCreateTable = sinon.spy(t.context.DatabaseManager._qb, 'createTable')
// })

// test.afterEach((t) => {
//   t.context.qbGet.restore()
//   t.context.qbDelete.restore()
//   t.context.qbSelect.restore()
//   t.context.qbUpdate.restore()
//   t.context.qbInsert.restore()
//   t.context.qbCreateTable.restore()
// })

// test.serial('add client', async (t) => {
//   const client = await t.context.DatabaseManager.addClient('1', '!')
//   t.truthy(client.some(obj => obj.id === '1' && obj.prefix === '!'))
//   t.true(t.context.qbInsert.calledTwice)
// })

// test.serial('add status', async (t) => {
//   const exists = await t.context.DatabaseManager._qb._knex.schema.hasTable('statuses')
//   if (!exists) {
//     await t.context.DatabaseManager._qb._knex.schema.createTable('statuses', (table) => {
//       table.string('name')
//         .defaultTo('a-new-status')
//       table.integer('type')
//         .defaultTo(0)
//       table.boolean('default')
//         .defaultTo(true)
//     })
//   }

//   t.truthy(await t.context.DatabaseManager.addStatus('a-new-status', 0, true))
//   t.true(t.context.qbInsert.calledTwice)
// })

// test.serial('get default status', async (t) => {
//   const defaultStatus = JSON.stringify(await t.context.DatabaseManager.getDefaultStatus())
//   t.deepEqual(defaultStatus, JSON.stringify({ name: 'a-new-status', type: 0 }))
//   t.true(t.context.qbGet.callCount === 0)
// })

// test.serial('get settings', async (t) => {
//   const settings = JSON.stringify(await t.context.DatabaseManager.getSettings('1'))
//   t.deepEqual(settings, JSON.stringify({ id: '1', prefix: '!' }))
//   t.true(t.context.qbGet.callCount === 0)
// })

// test.serial('get statuses', async (t) => {
//   t.true((await t.context.DatabaseManager.getStatuses()) instanceof Array)
//   t.true(t.context.qbGet.callCount === 0)
// })

// test.serial('get toggles', async (t) => {
//   const toggles = JSON.stringify(await t.context.DatabaseManager.getToggles('1'))
//   t.deepEqual(toggles, JSON.stringify({ id: '1', prefix: '!' }))
//   t.true(t.context.qbGet.callCount === 0)
// })

// test.todo('initialize')

// test.serial('remove client', async (t) => {
//   t.is(await t.context.DatabaseManager.removeClient('1'), undefined)
//   t.true(t.context.qbDelete.callCount === 0)
// })

// test.serial('remove status', async (t) => {
//   await t.context.DatabaseManager.addStatus('delete-this', 1)
//   t.falsy((await t.context.DatabaseManager.removeStatus('delete-this')).find(r => r.name === 'delete-this'))
//   t.true(t.context.qbDelete.callCount === 0)
// })

// test.serial('update default status', async (t) => {
//   const status = await t.context.DatabaseManager.updateDefaultStatus('a-new-status', 0)
//   t.truthy(status.some(({ name }) => name === 'a-new-status'))
//   t.true(t.context.qbUpdate.callCount === 0)
// })

// test.todo('update default prefix')

// test.serial('update settings', async (t) => {
//   const settings = await t.context.DatabaseManager.updateSettings('1', { id: '2', prefix: '.' })

//   t.is(settings, undefined)
//   t.true(t.context.qbUpdate.callCount === 0)
// })

// test.serial('create tables', async (t) => {
//   const exists = await t.context.DatabaseManager._qb._knex.schema.hasTable('some-table')
//   if (exists) await t.context.DatabaseManager._qb._knex.schema.dropTable('some-table')

//   await t.context.DatabaseManager._createTables({
//     'some-table': [
//       {
//         name: 'id',
//         type: 'string',
//         primary: true
//       }
//     ]
//   })

//   t.is(await t.context.DatabaseManager._qb.select('some-table'), undefined)
//   t.true(t.context.qbCreateTable.callCount === 0)
//   t.true(t.context.qbSelect.calledTwice)
// })
