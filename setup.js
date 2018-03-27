const { DB_CREDENTIALS } = require('./config.json')
const db = require('knex')({ client: 'mysql', connection: DB_CREDENTIALS })

db.schema.createTable('guild_settings', (table) => {
  table.charset('utf8')
  table.string('id').primary()
  table.string('vip')
  table.string('prefix')
}).then(() => {
  db.schema.createTable('global_settings', (table) => {
    table.charset('utf8')
    table.integer('id').primary()
    table.string('defaultPrefix').defaultTo('!')
    table.string('defaultGame')
    table.boolean('randomGames')
  }).then(() => {
    db('global_settings').insert({ id: 0, randomGames: false, defaultGame: null })
    .then(() => {
      db.schema.createTable('games', (table) => {
        table.charset('utf8')
        table.string('name').primary()
      }).then(() => { db.destroy() })
    })
  })
})
