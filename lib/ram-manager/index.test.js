import test from 'ava'
import sinon from 'sinon'

import RAMManager from '.'
import DatabaseQuery from '../database-query'

test('_addStoreIfNeeded/adds a store', (t) => {
  const dbm = new RAMManager()
  const type = 'new type'

  dbm._addStoreIfNeeded(type)

  t.deepEqual(dbm._store.get(type), new Map())
  t.is(dbm._idCount.get(type), 0)
})

test('_addStoreIfNeeded/does not add a store', (t) => {
  const dbm = new RAMManager()
  const type = 'new type'
  dbm._store.set(type, new Map())
  sinon.spy(dbm._store, 'set')
  sinon.spy(dbm._idCount, 'set')

  dbm._addStoreIfNeeded(type)

  t.false(dbm._store.set.called)
  t.false(dbm._idCount.set.called)
})

test('get/gets by ID', async (t) => {
  const dbm = new RAMManager()
  sinon.stub(dbm, '_addStoreIfNeeded')
  const type = 'type'
  const getId = 2
  const obj = {
    val: 'jhg'
  }

  dbm._store.set(type, new Map())
  dbm._store.get(type).set(getId, obj)
  const res = await dbm.get({ type, getId })

  t.is(res, obj)
  t.true(dbm._addStoreIfNeeded.calledOnceWithExactly(type))
})

test.failing('find/finds a person by name', async (t) => {
  const dbm = new RAMManager()
  sinon.stub(dbm, '_addStoreIfNeeded')
  const type = 'person'
  const person1 = {
    name: 'Alex'
  }
  const person2 = {
    name: 'Stephen'
  }

  const query = new DatabaseQuery(null, type).equalTo('name', person1)

  await dbm.add(type, person1)
  await dbm.add(type, person2)

  const res = await dbm.find(query)

  t.deepEqual(res, [ person1 ])
})
