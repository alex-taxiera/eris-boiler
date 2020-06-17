import {
  BotActivityType,
} from 'eris'

type ActivityMessages = {
  [type in BotActivityType]: string
}

export interface StatusStruct {
  name: string
  type: BotActivityType
}

export class Status implements StatusStruct {

  constructor (
    public readonly name: string,
    public readonly type: BotActivityType,
  ) {}

  public static Activities: ActivityMessages = {
    0: 'Playing',
    1: 'Streaming',
    2: 'Listening to',
    3: 'Watching',
  }

  public static isStatus (status: any): status is StatusStruct {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return (status.type in Status.Activities) && typeof status.name === 'string'
  }

  public static equal (...statuses: Array<StatusStruct>): boolean {
    const [ first, ...rest ] = statuses

    return rest.every(
      (status) => status.name === first.name && status.type === first.type,
    )
  }

}
