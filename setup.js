const { DB_CREDENTIALS, DEFAULT } = require('./config.json')
const db = require('knex')({ client: 'mysql', connection: DB_CREDENTIALS })

db.schema.createTable('guild_settings', (table) => {
  table.charset('utf8')
  table.string('id').primary()
  table.string('vip')
  table.string('prefix').defaultTo(DEFAULT.prefix)
})
.then(() => {
  db.schema.createTable('statuses', (table) => {
    table.charset('utf8')
    table.string('name').primary()
    table.integer('type').defaultTo(0)
    table.boolean('default').defaultTo('false')
  })
  .then(() => {
    db('statuses').insert({ name: DEFAULT.status, default: true })
    .then(() => process.exit())
  })
})
