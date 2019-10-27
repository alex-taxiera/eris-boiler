
exports.up = (knex) => {
  return knex.schema.createTable('guild', (t) => {
    t.string('id').primary().notNull()
    t.string('prefix').defaultTo(null)
    t.string('vip').defaultTo(null)
  })
}

exports.down = (knex) => {
  return knex.schema.dropTable('guild')
}
