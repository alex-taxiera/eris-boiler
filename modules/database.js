const { DB_CREDENTIALS } = require('../config.json')
const db = require('knex')({ client: 'mysql', connection: DB_CREDENTIALS })

// exports

function addClient (id) {
  return insert({ table: 'guild_settings', data: { id } })
}

function addGame (name) {
  return insert({ table: 'games', data: {name} })
}

function getClient (id) {
  return select({ table: 'guild_settings', where: { id } })
}

async function getGames () {
  return select({ table: 'games' })
}

function getSettings () {
  return select({ table: 'global_settings' })
}

async function initialize (guilds) {
  let tmpGuilds = new Map(guilds)
  const saved = await select({ table: 'guild_settings' })
  if (saved) {
    for (let i = 0; i < saved.length; i++) {
      const id = saved[i].id
      const guild = tmpGuilds.get(id)
      if (guild) {
        tmpGuilds.delete(id)
        if (saved[i].vip && !guild.roles.get(saved[i].vip)) module.exports.updateClient(id, { vip: null })
        continue
      }
      await module.exports.removeClient(saved[i].id)
    }
  }
  for (const [id] of guilds) {
    module.exports.addClient(id)
  }
}

function removeClient (id) {
  return del({ table: 'guild_settings', where: { id } })
}

function updateClient (id, data) {
  return update({ table: 'guild_settings', data, where: { id } })
}

function updateSettings (data) {
  return update({ table: 'global_settings', where: { id: 0 }, data })
}

// Knexjs queries

function count (table) {
  return db(table).count('*')
  .then((val) => val[0]['count(*)'])
  .catch((e) => undefined)
}

function del ({ table, where }) {
  return db(table).where(where).del()
  .then((success) => 0)
  .catch((e) => e)
}

function insert ({ table, data }) {
  return db(table).insert(data)
  .then((success) => 0)
  .catch((e) => undefined)
}

async function select ({ table, columns = '*', offset = 0, limit = null, where = true }) {
  if (!limit) limit = await count(table)
  return db(table).select(columns).where(where).offset(offset).limit(limit)
  .then((rows) => rows[1] ? rows : rows[0])
  .catch((e) => undefined)
}

function update ({ table, where, data }) {
  return db(table).where(where).update(data)
  .then((success) => 0)
  .catch((e) => undefined)
}

module.exports = { addClient, addGame, getClient, getGames, getSettings, initialize, removeClient, updateClient, updateSettings }
