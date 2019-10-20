const nodemon = require('nodemon')
const { Utils: { logger } } = require('../')

nodemon({
  script: 'demo/index.js',
  ext: 'js',
  watch: './'
})

nodemon
  .on('start', () => logger.info('Nodemon started'))
  .on('quit', () => {
    logger.error('Nodemon quit'); process.exit()
  })
  .on('restart', ([ file ] = []) =>
    file
      ? logger.warn(file, 'changed')
      : logger.warn('Restarting')
  )
  .on('crash', () => logger.error('Crashed'))
