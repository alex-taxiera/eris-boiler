import {
  Client
} from 'eris-boiler'
import {
  StatusStruct,
  Status
} from '@modules/status'

export type StatusSource = StatusStruct | Array<StatusStruct>

export type StatusGenerator = () => StatusSource | Promise<StatusSource>

export interface StatusManagerOptions {
  multiMode: 'random' | 'rotation'
  interval: number
}

export function manageStatus (
  client: Client,
  source: StatusSource | StatusGenerator,
  options?: StatusManagerOptions
): Client {
  if (Status.isStatus(source)) {
    client.on('ready', () => {
      client.editStatus('online', source)
    })
  } else {
    let selector: StatusGenerator

    if (typeof source === 'function') {
      selector = source
    } else {
      selector = (): StatusSource => source
    }

    const realOptions: StatusManagerOptions = {
      multiMode: 'random',
      interval: 12 * 60 * 60 * 1000,
      ...options
    }
    let lastIndex = -1

    const useSelector = async (): Promise<void> => {
      const statuses = await selector()
      let status: StatusStruct
      if (Array.isArray(statuses)) {
        if (options?.multiMode === 'rotation') {
          if (lastIndex >= statuses.length) {
            lastIndex = -1
          }
          status = statuses[++lastIndex]
        } else {
          status = statuses[Math.floor(Math.random() * statuses.length)]
        }
      } else {
        status = statuses
      }

      if (status) {
        client.editStatus('online', status)
      }
    }

    client.on('ready', () => {
      useSelector()

      setInterval(() => {
        useSelector()
      }, realOptions.interval)
    })
  }

  return client
}
