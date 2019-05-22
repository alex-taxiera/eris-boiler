import test from 'ava'
import sinon from 'sinon'

import StatusManager from './'

const buildStatusManager = (statuses = [], options) =>
  new StatusManager({
    editStatus: (status, activity) => null
  }, {
    add: async (type, data) => buildDBStatus(data),
    newObject: (type) => {
      switch (type) {
        case 'status':
          return {
            save: () => null
          }
        default: break
      }
    },
    newQuery: (type) => {
      switch (type) {
        case 'status':
          return {
            equal: {},
            notEqual: {},
            equalTo: function (prop, val) {
              this.equal[prop] = val
              return this
            },
            notEqualTo: function (prop, val) {
              this.notEqual[prop] = val
              return this
            },
            find: async function () {
              return statuses
                .filter((status) =>
                  Object.entries(this.equal)
                    .every(([ key, val ]) => status[key] === val)
                )
                .filter((status) =>
                  Object.entries(this.notEqual)
                    .every(([ key, val ]) => status[key] !== val)
                )
                .map(buildDBStatus)
            }
          }
        default: break
      }
    }
  }, options)

const buildDBStatus = (status) => ({
  data: status,
  toJSON: function () {
    return this.data
  },
  delete: async () => null,
  get: function (prop) {
    return this.data[prop]
  }
})

test('initialize/calls setStatus with default status', async (t) => {
  const manager = buildStatusManager(
    [], { defaultStatus: { name: 'game', type: 0 } }
  )
  const setStatusSpy = sinon.spy(manager, 'setStatus')
  await manager.initialize()
  t.true(setStatusSpy.calledOnceWithExactly(manager.defaultStatus))
})

test('getStatuses/calls database manager', async (t) => {
  const manager = buildStatusManager([ { name: 'game', type: 0 } ])
  const newQuerySpy = sinon.spy(manager._dbm, 'newQuery')
  const statuses = await manager.getStatuses()

  t.is(statuses.length, 1)
  t.true(newQuerySpy.calledOnceWithExactly('status'))
})

test('findStatusByName/calls database manager', async (t) => {
  const manager = buildStatusManager([
    { name: 'game', type: 0 }, { name: 'notgame', type: 0 }
  ])
  const newQuerySpy = sinon.spy(manager._dbm, 'newQuery')
  const statuses = await manager.findStatusByName('game')

  t.is(statuses.length, 1)
  t.is(statuses[0].toJSON().name, 'game')
  t.true(newQuerySpy.calledOnceWithExactly('status'))
})

test('addStatus/calls database manager and getStatuses', async (t) => {
  const manager = buildStatusManager()
  const getStatusesSpy = sinon.spy(manager, 'getStatuses')
  const addSpy = sinon.spy(manager._dbm, 'add')
  const newStatus = { name: 'game', type: 0 }
  await manager.addStatus(newStatus)
  t.true(getStatusesSpy.calledOnce)
  t.true(addSpy.calledOnceWithExactly('status', newStatus))
})

test('addStatus/no old statuses branch', async (t) => {
  const manager = buildStatusManager()
  const setStatusSpy = sinon.spy(manager, 'setStatus')
  const newStatus = { name: 'game', type: 0 }
  await manager.addStatus(newStatus)
  t.true(setStatusSpy.calledOnceWithExactly(sinon.match(newStatus)))
})

test('addStatus/starts timer in random mode branch', async (t) => {
  const manager = buildStatusManager(
    [ { name: 'game', type: 0 } ], { mode: 'random' }
  )
  const timerStartSpy = sinon.spy(manager, 'timerStart')
  await manager.addStatus({ name: 'new', type: 0 })
  t.true(timerStartSpy.calledOnce)
})

test('deleteStatus/calls dbObject delete', async (t) => {
  const manager = buildStatusManager()
  const status = buildDBStatus({ name: 'game', type: 0 })
  const objectDeleteSpy = sinon.spy(status, 'delete')
  await manager.deleteStatus(status)
  t.true(objectDeleteSpy.calledOnce)
})

test('deleteStatus/if current is deleted, current is cleared', async (t) => {
  const manager = buildStatusManager()
  const status = { name: 'game', type: 0 }
  manager.current = status
  await manager.deleteStatus(buildDBStatus(status))
  t.falsy(manager.current)
})

test('deleteStatus/if no statuses left, sets to default', async (t) => {
  const manager = buildStatusManager(
    [], { defaultStatus: { name: 'game', type: 0 } }
  )
  const setStatusSpy = sinon.spy(manager, 'setStatus')
  await manager.deleteStatus(buildDBStatus({ name: 'game', type: 0 }))
  t.true(setStatusSpy.calledOnceWithExactly(manager.defaultStatus))
})

test('deleteStatus/if some statuses remain, sets randomly', async (t) => {
  const manager = buildStatusManager()
  const setStatusSpy = sinon.spy(manager, 'setStatus')
  await manager.deleteStatus(buildDBStatus({ name: 'game', type: 0 }))
  t.true(setStatusSpy.calledOnceWithExactly(undefined))
})

test('timerStart/calls setInterval with setStatus', (t) => {
  const manager = buildStatusManager([], { interval: 10 })
  const clock = sinon.useFakeTimers()
  const setStatusSpy = sinon.spy(manager, 'setStatus')
  manager.timerStart()
  clock.tick(10)
  t.true(setStatusSpy.calledOnceWithExactly())
})

test('timerEnd/clears _timer', (t) => {
  const manager = buildStatusManager([], { interval: 10 })
  manager._timer = setInterval(() => null, 100000)
  t.truthy(manager._timer)
  manager.timerEnd()
  t.falsy(manager._timer)
})

test('_random/if one or less statuses, should call timerEnd', async (t) => {
  const manager = buildStatusManager()
  const timerEndSpy = sinon.spy(manager, 'timerEnd')
  await manager._randomStatus()
  t.true(timerEndSpy.calledOnce)
})

test('_random/if more than one status, calls timerStart', async (t) => {
  const manager = buildStatusManager(
    [ { name: 'game', type: 0 }, { name: 'notgame', type: 0 } ],
    { mode: 'random' }
  )
  const timerStartSpy = sinon.spy(manager, 'timerStart')
  await manager._randomStatus()
  t.true(timerStartSpy.calledOnce)
})

test('_random/if more than one status, returns status that is not current',
  async (t) => {
    const current = { name: 'game', type: 0 }
    const manager = buildStatusManager(
      [ current, { name: 'notgame', type: 0 } ],
      { mode: 'random' }
    )
    manager.current = current
    const newStatus = await manager._randomStatus()
    t.notDeepEqual(newStatus, current)
  }
)

test('_random/if one status, returns if it is not current', async (t) => {
  const current = null
  const only = { name: 'notgame', type: 0 }
  const manager = buildStatusManager([ only ], { mode: 'random' })
  manager.current = current
  const newStatus = await manager._randomStatus()
  t.notDeepEqual(newStatus, current)
  t.deepEqual(newStatus, only)
})
// eslint-disable-next-line max-len
test('setStatus/if no status provided and statuses exist and mode is random, call _randomStatus and editStatus',
  async (t) => {
    const only = { name: 'notgame', type: 0 }
    const manager = buildStatusManager([ only ], { mode: 'random' })
    const randomStatusSpy = sinon.spy(manager, '_randomStatus')
    const editStatusSpy = sinon.spy(manager._bot, 'editStatus')
    await manager.setStatus()
    t.deepEqual(manager.current, only)
    t.true(randomStatusSpy.calledOnce)
    t.true(editStatusSpy.calledOnceWithExactly('online', only))
  }
)

test('setStatus/if no status provided and mode is manual, do nothing',
  async (t) => {
    const manager = buildStatusManager()
    const randomStatusSpy = sinon.spy(manager, '_randomStatus')
    const editStatusSpy = sinon.spy(manager._bot, 'editStatus')
    await manager.setStatus()
    t.true(randomStatusSpy.notCalled)
    t.true(editStatusSpy.notCalled)
  }
)

test('setStatus/if status provided and is good, set status to provided',
  async (t) => {
    const status = { name: 'notgame', type: 0 }
    const manager = buildStatusManager()
    const editStatusSpy = sinon.spy(manager._bot, 'editStatus')
    await manager.setStatus(status)
    t.true(editStatusSpy.calledOnceWithExactly('online', status))
  }
)

test('setStatus/if status provided with bad type, fix type and set status',
  async (t) => {
    const status = { name: 'notgame', type: 99 }
    const manager = buildStatusManager()
    const editStatusSpy = sinon.spy(manager._bot, 'editStatus')
    await manager.setStatus(status)
    t.true(
      editStatusSpy.calledOnceWithExactly(
        'online', { name: 'notgame', type: 0 }
      )
    )
  }
)

test('setStatus/if status provided with bad name and random mode, set randomly',
  async (t) => {
    const status = { name: 123, type: 99 }
    const manager = buildStatusManager([], { mode: 'random' })
    const randomStatusSpy = sinon.spy(manager, '_randomStatus')
    await manager.setStatus(status)
    t.true(randomStatusSpy.called)
  }
)
