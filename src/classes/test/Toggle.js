import test from 'ava'
import Toggle from '../Toggle'
import Client from '../DataClient'
import config from '../../../config/config.json'

test.before(t => {
    t.context.Toggle = new Toggle()
    t.context.client = new Client(config)
})

test('enable', t => {
    const { client } = t.context
    t.is(t.context.Toggle.enable(), `${client.name} set to true`)
})

test('disable', t => {
    const { client } = t.context
    t.is(t.context.Toggle.disable(), `${client.name} set to false`)
})