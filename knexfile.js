// Update with your config settings.

module.exports = {
  development: {
    client: process.env.EB_DB_CLIENT,
    connection: {
      username: process.env.EB_DB_USER,
      password: process.env.EB_DB_PASS,
      name: process.env.EB_DB_NAME,
      host: process.env.EB_DB_HOST
    }
  }
}
