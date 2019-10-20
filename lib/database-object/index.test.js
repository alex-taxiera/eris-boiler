import test from 'ava'
import sinon from 'sinon'

import DatabaseObject from '.'
import DatabaseManager from '../database-manager'

const buildGenericDBM = () => {
  const dbm = new DatabaseManager()
  sinon.stub(dbm, 'add').callsFake(async (type, data) => data)
  sinon.stub(dbm, 'update').callsFake(async (obj) => obj._data)
  sinon.stub(dbm, 'delete').callsFake(async (data) => {})

  return dbm
}

test('get/works', (t) => {
  const data = { prop: 2 }
  const obj = new DatabaseObject(buildGenericDBM(), 'test', data)
  t.is(obj.get('prop'), data.prop)
})

test('set/works', (t) => {
  const data = { newprop: 44 }
  const obj = new DatabaseObject(buildGenericDBM(), 'test')
  obj.set('newprop', data.newprop)
  t.is(obj.get('newprop'), data.newprop)
})

test('toJSON/works', (t) => {
  const data = { prop: 2 }
  const obj = new DatabaseObject(buildGenericDBM(), 'test', data)
  t.deepEqual(obj.toJSON(), { ...data, objectType: 'test' })
})

test('delete/calls database manager delete', async (t) => {
  const stubManager = buildGenericDBM()
  const obj = new DatabaseObject(stubManager, 'test')
  await obj.delete()
  t.true(stubManager.delete.calledOnce)
})

test('save/adds a new object', async (t) => {
  const stubManager = buildGenericDBM()

  const data = { prop: 42 }
  const obj = new DatabaseObject(stubManager, 'test', data, { isNew: true })
  const ref = await obj.save()

  t.true(stubManager.add.calledOnceWithExactly('test', data))
  t.is(ref, obj)
})

test('save/updates an existing object', async (t) => {
  const stubManager = buildGenericDBM()

  const data = { prop: 42 }
  const obj = new DatabaseObject(stubManager, 'test', data)
  obj._saveNeeded = true
  const ref = await obj.save()

  t.true(stubManager.update.calledOnceWithExactly(obj))
  t.is(ref, obj)
})

test('save/saves data from param', async (t) => {
  const stubManager = buildGenericDBM()

  const data = { prop: 42 }
  const newData = { newProp: 23 }
  const obj = new DatabaseObject(stubManager, 'test', data, { isNew: true })
  const ref = await obj.save(newData)

  t.true(stubManager.add.calledOnce)
  t.deepEqual(stubManager.add.getCall(0).args[1], { ...data, ...newData })
  t.is(ref, obj)
})
