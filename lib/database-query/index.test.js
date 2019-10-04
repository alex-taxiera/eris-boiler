import test from 'ava'
import sinon from 'sinon'

import DatabaseQuery from '.'
import DatabaseManager from '../database-manager'

const buildGenericDBM = (mockData = [ { id: 1 } ]) => {
  const dbm = new DatabaseManager()
  sinon.stub(dbm, 'add').callsFake(async (type, data) => data)
  sinon.stub(dbm, 'update').callsFake(async (obj) => obj._data)
  sinon.stub(dbm, 'delete').callsFake(async (data) => {})
  sinon.stub(dbm, 'newObject').callsFake((type, data, isNew = true) => data)
  sinon.stub(dbm, 'find').callsFake(async (query) => mockData)
  sinon.stub(dbm, 'get').callsFake(
    async (query) => mockData.find((item) => item.id === query.getId)
  )

  return dbm
}

const buildDBQuery = (type = 'type', mockData) => {
  return new DatabaseQuery(buildGenericDBM(mockData), type)
}

test('static _compileQueries/works for and', (t) => {
  const type = 'yeet'
  const query1 = new DatabaseQuery(null, type).equalTo('one', 2)
  const query2 = new DatabaseQuery(null, type).equalTo('two', 4)
  const query = DatabaseQuery.and([ query1, query2 ])

  t.deepEqual(query.conditions, query1.conditions)
  t.is(query.subQueries[0].type, 'and')
  t.deepEqual(query.subQueries[0].query[0].conditions, query2.conditions)
})

test('static _compileQueries/works for or', (t) => {
  const type = 'yeet'
  const query1 = new DatabaseQuery(null, type).equalTo('one', 2)
  const query2 = new DatabaseQuery(null, type).equalTo('two', 4)
  const query = DatabaseQuery.or([ query1, query2 ])

  t.deepEqual(query.conditions, query1.conditions)
  t.is(query.subQueries[0].type, 'or')
  t.deepEqual(query.subQueries[0].query[0].conditions, query2.conditions)
})

test('or/calls _addSubqueries', (t) => {
  const dbQuery = buildDBQuery()
  sinon.stub(dbQuery, '_addSubqueries')
  const subs = [ 1, 2 ]

  dbQuery.or(subs)
  t.true(dbQuery._addSubqueries.calledOnceWithExactly('or', subs))
})

test('and/calls _addSubqueries', (t) => {
  const dbQuery = buildDBQuery()
  sinon.stub(dbQuery, '_addSubqueries')
  const subs = [ 1, 2 ]

  dbQuery.and(subs)
  t.true(dbQuery._addSubqueries.calledOnceWithExactly('and', subs))
})

test('limit/sets limit', (t) => {
  const dbQuery = buildDBQuery()
  const limit = 5
  const updated = dbQuery.limit(limit)
  t.is(updated.maxResults, limit)
})

test('equalTo/calls _addCondition', (t) => {
  const dbQuery = buildDBQuery()
  sinon.stub(dbQuery, '_addCondition')
  const data = { prop: 'prop', val: 'val' }

  dbQuery.equalTo(data.prop, data.val)
  t.true(
    dbQuery._addCondition.calledOnceWithExactly('equalTo', data.prop, data.val)
  )
})

test('notEqualTo/calls _addCondition', (t) => {
  const dbQuery = buildDBQuery()
  sinon.stub(dbQuery, '_addCondition')
  const data = { prop: 'prop', val: 'val' }

  dbQuery.notEqualTo(data.prop, data.val)
  t.true(
    dbQuery._addCondition
      .calledOnceWithExactly('notEqualTo', data.prop, data.val)
  )
})

test('lessThan/calls _addCondition', (t) => {
  const dbQuery = buildDBQuery()
  sinon.stub(dbQuery, '_addCondition')
  const data = { prop: 'prop', val: 2 }

  dbQuery.lessThan(data.prop, data.val)
  t.true(
    dbQuery._addCondition.calledOnceWithExactly('lessThan', data.prop, data.val)
  )
})

test('greaterThan/calls _addCondition', (t) => {
  const dbQuery = buildDBQuery()
  sinon.stub(dbQuery, '_addCondition')
  const data = { prop: 'prop', val: 2 }

  dbQuery.greaterThan(data.prop, data.val)
  t.true(
    dbQuery._addCondition
      .calledOnceWithExactly('greaterThan', data.prop, data.val)
  )
})

test('find/calls dbm to find an entry', async (t) => {
  const type = 'testing this'
  const mockData = [ { mock: 'data' } ]
  const dbQuery = buildDBQuery(type, mockData)

  const res = await dbQuery.find()

  t.deepEqual(res, mockData)
  t.true(dbQuery._dbm.find.calledOnceWithExactly(dbQuery))
  t.true(dbQuery._dbm.newObject.calledOnceWithExactly(type, mockData[0], false))
})

test('get/calls dbm to get an entry and sets getId', async (t) => {
  const type = 'testing this'
  const mockData = [ { id: 1 }, { id: 2 } ]
  const dbQuery = buildDBQuery(type, mockData)

  const res = await dbQuery.get(2)

  t.is(dbQuery.getId, 2)
  t.deepEqual(res, mockData[1])
})

test('_addCondition/adds a condition and returns the query object', (t) => {
  const prop = 'prop'
  const data = { type: 'this is the type', value: 'value' }
  const dbQuery = buildDBQuery(data.type)

  const updated = dbQuery._addCondition(data.type, prop, data.value)

  t.is(updated, dbQuery)
  t.deepEqual(dbQuery.conditions[prop], data)
})

test('_addSubqueries/adds a subquery and returns the query object', (t) => {
  const type = 'and'
  const data = { conditions: 'prop', subQueries: 'value' }
  const dbQuery = buildDBQuery()
  sinon.stub(dbQuery, '_sanitizeQueries')
    .callsFake((data) => {
      console.log('data :', data)
      return data
    })

  const updated = dbQuery._addSubqueries(type, data)
  console.log('updated :', updated)
  t.is(updated, dbQuery)
  t.deepEqual(dbQuery.subQueries, [ { type, query: data } ])
})

test('_sanitizeQueries/cleans up an array', (t) => {
  const type = 'object type'
  const data = { conditions: 'prop', subQueries: 'value' }
  const dbQuery = buildDBQuery(type)

  const res = dbQuery._sanitizeQueries([ { ...data, type } ])
  t.deepEqual(res, [ data ])
})

test('_sanitizeQueries/can work with a single object', (t) => {
  const type = 'object type'
  const data = { conditions: 'prop', subQueries: 'value' }
  const dbQuery = buildDBQuery(type)

  const res = dbQuery._sanitizeQueries({ ...data, type })
  t.deepEqual(res, [ data ])
})

test('_sanitizeQueries/throws type mismatches', (t) => {
  const type = 'object type'
  const data = { conditions: 'prop', subQueries: 'value' }
  const dbQuery = buildDBQuery(type)

  t.throws(
    () => dbQuery._sanitizeQueries([ { ...data, type: 'a different type' } ]),
    {
      instanceOf: TypeError,
      message: 'mismatched query types'
    }
  )
})
