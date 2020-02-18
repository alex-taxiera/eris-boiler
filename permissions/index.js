module.exports = {
  isIndex: true,
  admin: require('./admin'),
  owner: require('./owner'),
  vip: require('./vip'),
  createGeneric: (x) => x
}
