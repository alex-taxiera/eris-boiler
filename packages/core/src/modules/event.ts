import { LoadableMap } from '@modules/loadable'

export interface Event {
  name: string
  handler: (...args: any) => void
}

export abstract class EventMap<
T extends Event,
> extends LoadableMap<T> {

  protected isValid (loadable: unknown): loadable is T {
    if (
      loadable == null ||
      typeof loadable !== 'object' ||
      !('name' in loadable) ||
      !('handler' in loadable)
    ) {
      return false
    }

    return true
  }

}
