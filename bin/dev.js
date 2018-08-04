const nodemon = require('nodemon')

nodemon({
  script: 'demo/index.js',
  ext: 'js',
  watch: './'
})

nodemon
  .on('start', () => console.log('App has started'))
  .on('quit', () => { console.log('App has quit'); process.exit() })
  .on('restart', (files) => console.log('App restarted due to: ', files))
  .on('crash', () => console.log('crashed'))
