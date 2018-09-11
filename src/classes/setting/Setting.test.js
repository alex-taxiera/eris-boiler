import test from 'ava'

import {
  Setting,
  DataClient
} from '../'

require('dotenv').load()

const client = new DataClient(process.env)

const mockData = {
  name: 'setting-test-name',
  prettyName: 'settingTestName',
  _onChange: () => {
    console.log('Something in the setting class changed')
  }
}

test.before((t) => {
  t.context.Setting = new Setting(mockData)
})

test('Set Value', (t) => {
  t.is(t.context.Setting.setValue('setting-test-value', client), `${mockData.name} set to setting-test-value!`)
  t.is(t.context.Setting.value, 'setting-test-value')
})
