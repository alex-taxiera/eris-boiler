const nodemon = require('nodemon')

try {
  nodemon({
    script: 'src/index.js',
    ext: 'js',
    watch: 'src'
  })
} catch (e) {
  console.error(e.message, e.stack)
}
