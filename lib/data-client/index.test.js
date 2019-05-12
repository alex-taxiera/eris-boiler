import test from 'ava'

import DataClient from '.'

test.before((t) => {
  t.context.DataClient = new DataClient()
})
