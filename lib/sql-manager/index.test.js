import test from 'ava'
import { config } from 'dotenv'

import SQLManager from '.'
import DatabaseQuery from '../database-query'

config()

const buildSQLManager = () => new SQLManager({
  client: process.env.DB_CLIENT,
  connectionInfo: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  }
})

const peopleSeed = {
  db: 'int_test_people',
  columns: [
    {
      type: 'increments',
      name: 'id',
      primary: true
    },
    {
      type: 'string',
      name: 'name'
    },
    {
      type: 'integer',
      name: 'age'
    }
  ],
  data: {
    P1: {
      name: 'Alex',
      age: 15
    },
    P2: {
      name: 'Stephen',
      age: 16
    },
    P3: {
      name: 'Stephen',
      age: 12
    },
    P4: {
      name: 'Stephen',
      age: 21
    },
    P5: {
      name: 'Carl',
      age: 22
    }
  }
}

test.beforeEach(async (t) => {
  const dbm = buildSQLManager()

  await dbm._qb.schema.dropTableIfExists(peopleSeed.db)
  await dbm._qb.schema.createTable(peopleSeed.db, (table) => {
    if (dbm._qb.client.config.client === 'mysql') {
      table.charset('utf8')
    }
    for (const column of peopleSeed.columns) {
      if (!table[column.type]) {
        throw Error(
          `'${column.name}' uses '${column.type}'
        which is not an existing type.`
        )
      }
      if (column.primary === true && column.default !== undefined) {
        table[column.type](column.name)
          .primary()
          .defaultTo(column.default)
      } else if (column.primary === true) {
        table[column.type](column.name)
          .primary()
      } else if (column.default !== undefined) {
        table[column.type](column.name)
          .defaultTo(column.default)
      } else {
        table[column.type](column.name)
      }
    }
  })

  for (const person of Object.values(peopleSeed.data)) {
    await dbm._qb(peopleSeed.db).insert(person)
  }
})

test.after.always(async (t) => {
  const dbm = buildSQLManager()

  await dbm._qb.schema.dropTableIfExists(peopleSeed.db)
})

test.serial('add/works', async (t) => {
  const dbm = buildSQLManager()
  const newPerson = {
    name: 'Add Test',
    age: 0
  }

  const res = await dbm.add(peopleSeed.db, newPerson)

  t.deepEqual(res, { ...newPerson, id: res.id })
})

test.serial('update/works', async (t) => {
  const dbm = buildSQLManager()
  const [ oldPerson ] = await dbm._qb(peopleSeed.db).select('*').limit(1)
  const newPerson = {
    ...oldPerson,
    name: 'Update Test'
  }

  const res = await dbm.update({
    id: newPerson.id, type: peopleSeed.db, _data: newPerson
  })

  t.deepEqual(res, newPerson)
})

test.serial('get/gets by ID', async (t) => {
  const dbm = buildSQLManager()
  const getKey = 'id'
  const getValue = 2

  const res = await dbm.get({ type: peopleSeed.db, getValue, getKey })

  t.deepEqual(JSON.parse(JSON.stringify(res)), {
    ...peopleSeed.data.P2,
    id: getValue
  })
})

test.serial('find/finds a person by name', async (t) => {
  const dbm = buildSQLManager()

  const query = new DatabaseQuery(dbm, peopleSeed.db)
    .equalTo('name', peopleSeed.data.P1.name)

  const res = await dbm.find(query)

  t.deepEqual(JSON.parse(JSON.stringify(res)), [
    { ...peopleSeed.data.P1, id: 1 }
  ])
})

test.serial('find/combines equalTo, lessThan, and greaterThan', async (t) => {
  const dbm = buildSQLManager()
  const type = peopleSeed.db

  const query = DatabaseQuery.and([
    new DatabaseQuery(dbm, type).equalTo('name', peopleSeed.data.P2.name),
    DatabaseQuery.and([
      new DatabaseQuery(dbm, type).lessThan('age', 17),
      new DatabaseQuery(dbm, type).greaterThan('age', 11)
    ])
  ])

  const res = await dbm.find(query)

  t.deepEqual(JSON.parse(JSON.stringify(res)), [
    { ...peopleSeed.data.P2, id: 2 },
    { ...peopleSeed.data.P3, id: 3 }
  ])
})

test.serial('find/name or age range', async (t) => {
  const dbm = buildSQLManager()
  const type = peopleSeed.db

  const query = DatabaseQuery.or([
    new DatabaseQuery(dbm, type).equalTo('name', peopleSeed.data.P2.name),
    DatabaseQuery.and([
      new DatabaseQuery(dbm, type).lessThan('age', 17),
      new DatabaseQuery(dbm, type).greaterThan('age', 11)
    ])
  ])

  const res = await dbm.find(query)

  t.deepEqual(JSON.parse(JSON.stringify(res)), [
    { ...peopleSeed.data.P1, id: 1 },
    { ...peopleSeed.data.P2, id: 2 },
    { ...peopleSeed.data.P3, id: 3 },
    { ...peopleSeed.data.P4, id: 4 }
  ])
})
