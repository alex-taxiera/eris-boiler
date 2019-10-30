module.exports = (object, path, def) => (
  object = (path.split ? path.split('.') : path)
    .reduce((obj, p) => obj && obj[p], object)
) == null ? def : object
