import test from 'ava'
require('dotenv').load()
const QueryBuilder = require('../QueryBuilder.js')
const Logger = require('../Logger.js')

test.before(async (t) => {
  t.context.QueryBuilder = new QueryBuilder(Logger)
  t.context.tables = {
    general: 'QueryBuilderTest',
    empty: 'QueryBuilderTestEmpty',
    one: 'QueryBuilderTestOne'
  }
  for (const key in t.context.tables) {
    await t.context.QueryBuilder._knex.schema.createTable(t.context.tables[key], (table) => {
      table.charset('utf8')
      table.string('key').primary()
      table.string('string').defaultTo('string')
      table.integer('integer').defaultTo(0)
    })
  }
})

test.after.always(async (t) => {
  for (const key in t.context.tables) {
    await t.context.QueryBuilder._knex.schema.dropTable(t.context.tables[key])
  }
})

test('count: empty table', async (t) => {
  const table = t.context.tables.empty
  const output = await t.context.QueryBuilder._count(table)
  t.is(Number(await t.context.QueryBuilder._count(table)), 0)
})

test('count: table with one entry', (t) => {
  const table = t.context.tables.one
  return t.context.QueryBuilder._insert({table, data: {key: 'count one'}})
    .then(async (success) => t.is(success, 0))
    .then(async () => t.is(Number(await t.context.QueryBuilder._count(table)), 1))
})

test('delete', (t) => {
  const table = t.context.tables.general
  return t.context.QueryBuilder._insert({table, data: {key: 'delete this'}})
    .then(async (success) => t.is(success, 0))
    .then(() => t.context.QueryBuilder._delete({table, where: {key: 'delete this'}}))
    .then(async (success) => t.is(success, 0))
    .then(() => t.context.QueryBuilder._select({table, where: {key: 'delete this'}}))
    .then((rows) => t.is(rows, undefined))
})

test('get', (t) => {
  const table = t.context.tables.general
  return t.context.QueryBuilder._insert({table, data: {key: 'get this'}})
    .then(async (success) => t.is(success, 0))
    .then(() => t.context.QueryBuilder._get({table, where: {key: 'get this'}}))
    .then((item) => t.deepEqual(item, {key: 'get this', string: 'string', integer: 0}))
})

test('insert', (t) => {
  const table = t.context.tables.general
  return t.context.QueryBuilder._insert({table, data: {key: 'insert this'}})
    .then(async (success) => t.is(success, 0))
    .then(() => t.context.QueryBuilder._get({table, where: {key: 'insert this'}}))
    .then((item) => t.deepEqual(item, {key: 'insert this', string: 'string', integer: 0}))
})

test('select: an array as a string in db', (t) => {
  const table = t.context.tables.general
  return t.context.QueryBuilder._insert({table, data: {key: 'arr', string: JSON.stringify(['123', '456'])}})
    .then(async (success) => t.is(success, 0))
    .then(() => t.context.QueryBuilder._select({table, where: {key: 'arr'}}))
    .then((rows) => t.deepEqual(rows[0].string, ['123', '456']))
})

test('select: no matching rows should return undefined', (t) => {
  const table = t.context.tables.empty
  return t.context.QueryBuilder._select({table, where: {key: 'no such key'}})
    .then((rows) => t.is(rows, undefined))
})

test('update', (t) => {
  const table = t.context.tables.general
  return t.context.QueryBuilder._insert({table, data: {key: 'update this'}})
    .then(async (success) => t.is(success, 0))
    .then(() => t.context.QueryBuilder._update({table, where: {key: 'update this'}, data: {string: 'updated'}}))
    .then(async (success) => t.is(success, 0))
    .then(() => t.context.QueryBuilder._get({table, where: {key: 'update this'}}))
    .then((item) => t.deepEqual(item, {key: 'update this', string: 'updated', integer: 0}))
})
