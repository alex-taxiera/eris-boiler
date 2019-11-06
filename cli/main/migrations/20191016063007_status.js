
exports.up = (knex) => {
  return knex.schema.createTable('status', (t) => {
    t.increments('id').primary().notNull()
    t.string('name').notNull()
    t.integer('type').notNull().defaultTo(0)
  })
}

exports.down = (knex) => {
  return knex.schema.dropTable('status')
}
