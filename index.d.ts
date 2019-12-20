import {
    Client,
    Message,
    Collection,
    Member,
    ExtendedUser,
    TextChannel
} from 'eris'

import {
    ExtendedMap,
    Status
} from 'eris-boiler/util'

declare type CommandData<T extends DataClient> = {
    name: string
    description: string
    run: CommandAction<T>
    options?: CommandOptions<T>
}

declare type CommandOptions<T extends DataClient> = {
    aliases?: string[][]
    parameters?: string[]
    permission?: Permission
    deleteInvoking?: boolean
    deleteResponse?: boolean
    deleteResponseDelay?: number
    subCommands?: Command<T>[]
    dmOnly?: boolean
    guildOnly?: boolean
}

declare type CommandAction<T extends DataClient> = (context: CommandContext<T>) => CommandResults

declare type CommandContext<T extends DataClient> = {
    params: string[]
    msg: Message
    bot: T
}

declare type CommandResults = MessageData | string | Promise<CommandResults>

declare type MessageData = {
    content: string
}

declare class Command<T extends DataClient> {
    constructor(data: CommandData<T>)
    name: string
    description: string
    run: CommandAction<T>
    aliases: string[]
    parameters: string[]
    middleware: CommandMiddleware[]
    deleteInvoking: boolean
    deleteResponse: boolean
    deleteResponseDelay: number
    permission: Permission
    dmOnly: boolean
    guildOnly: boolean
    subCommands: ExtendedMap<string, Command<T>>
    info: string
}

declare class CommandMiddleware {
    constructor(data: CommandMiddlewareData)
    run: MiddlewareRun
}

declare type CommandMiddlewareData = {
    run?: CheckFunction
}

declare type MiddlewareRun = <T extends DataClient>(context: CommandContext<T>) => Promise<void>

declare type DataClientOptions = {
    databaseManager?: DatabaseManager
    oratorOptions?: OratorOptions
    statusManagerOptions?: StatusManagerOptions
}

declare type Loadable<T extends DataClient> = string | LoadableObject<T> | (string | LoadableObject<T>)[]

declare type LoadableObject<T extends DataClient> = Command<T> | DiscordEvent<T> | Permission

declare class DataClient extends Client {
    constructor(token: string, options?: DataClientOptions)
    dbm: DatabaseManager
    ora: Orator<this>
    sm: StatusManager
    commands: ExtendedMap<string, Command<this>>
    permissions: ExtendedMap<string, Permission>
    connect(): Promise<void>
    findCommand(name: string, commands: ExtendedMap<string, Command<this>>): Command<this> | void
    addCommands(...commands: (string | Command<this> | (string | Command<this>)[])[]): DataClient
    addEvents(...events: (string | DiscordEvent<this> | (string | DiscordEvent<this>)[])[]): DataClient
    addPermissions(...permissions: (string | Permission | (string | Permission)[])[]): DataClient
}

declare type DatabaseManagerOptions = {
    DataObject: DatabaseObjectBuilder
    DataQuery: DatabaseQueryBuilder
}

declare type DatabaseObjectBuilder = (...params: any[]) => DatabaseObject

declare type DatabaseQueryBuilder = (...params: any[]) => DatabaseQuery

declare abstract class DatabaseManager {
    newObject(type: string, data: any, isNew?: boolean): DatabaseObject
    newQuery(type: string): DatabaseQuery
    abstract add(type: string, data: any): Promise<any>
    abstract delete(object: DatabaseObject): Promise<void>
    abstract update(object: DatabaseObject): Promise<any>
    abstract get(query: DatabaseQuery): Promise<any>
    abstract find(query: DatabaseQuery): Promise<any[]>
}

declare type DatabaseObjectOptions = {
    isNew?: boolean
}

declare class DatabaseObject {
    constructor(databaseManager: DatabaseManager, type: string, data?: any, options?: DatabaseObjectOptions)
    type: string
    id: string
    get(prop: string): any
    set(prop: string, val: any): DatabaseObject
    toJSON(): any
    delete(): Promise<void>
    save(data?: any): Promise<DatabaseObject>
}


declare type SubQueryType = 'and' | 'or'

declare type SubQuery = {
    type: SubQueryType
    query: DatabaseQuery
}

declare class DatabaseQuery {
    constructor(databaseManager: DatabaseManager, type: string)
    type: string
    maxResults: number
    conditions: any
    sort: any
    getId: string
    subQueries: SubQuery[]
    static or(queries: DatabaseQuery[]): DatabaseQuery
    static and(queries: DatabaseQuery[]): DatabaseQuery
    or(queries: DatabaseQuery[]): this
    and(queries: DatabaseQuery[]): this
    limit(num: number): this
    equalTo(prop: string, val: any): this
    notEqualTo(prop: string, val: any): this
    lessThan(prop: string, num: number): this
    greaterThan(prop: string, num: number): this
    find(): Promise<DatabaseObject[]>
    get(id: string): Promise<DatabaseObject | void>
}

declare type DiscordEventData<T extends DataClient> = {
    name: string
    run: DiscordEventRunner<T>
}

declare type DiscordEventRunner<T> = (bot: T, ...rest: any[]) => void

declare class DiscordEvent<T extends DataClient> {
    constructor(data: DiscordEventData<T>)
    name: string
    run: DiscordEventRunner<T>
}

declare class Orator<T extends DataClient> {
    constructor(defaultPrefix: string, oratorOptions: OratorOptions)
    defaultPrefix: string
    permissions: Permission[]
    tryMessageDelete(me: ExtendedUser, msg: Message): Promise<void> | void
    tryCreateMessage(me: ExtendedUser, channel: TextChannel, content: string | any, file: any): Promise<Message | void> | void
    tryDMCreateMessage(me: ExtendedUser, msg: Message, content: string | any, file: any): Promise<void>
    processMessage(bot: DataClient, msg: Message): void
    hasPermission(context: CommandContext<T>): Promise<boolean>
}

declare type OratorOptions = {
    defaultPrefix?: string
    deleteInvoking?: boolean
    deleteResponse?: boolean
    deleteResponseDelay?: number
}

declare type CheckFunction = (member: Member, bot: DataClient) => boolean

declare type PermissionData = {
    level?: number
    reason?: string
    run?: CheckFunction
}

declare class Permission extends CommandMiddleware {
    constructor(data: PermissionData)
    run: MiddlewareRun
}

declare class RAMManager extends DatabaseManager {
    constructor()
    add(type: string, data: any): Promise<any>
    delete(object: DatabaseObject): Promise<void>
    update(object: DatabaseObject): Promise<any>
    get(query: DatabaseQuery): Promise<any>
    find(query: DatabaseQuery): Promise<any[]>
}

declare type ConnectionData = {
    connectionInfo: ConnectionInfo
    client: string
}

declare type ConnectionInfo = {
    database: string
    user: string
    password?: string
    host: string
}

declare class SQLManager extends DatabaseManager {
    constructor(connection: ConnectionData, options?: DatabaseManagerOptions)
    add(type: string, data: any): Promise<any>
    delete(object: DatabaseObject): Promise<void>
    update(object: DatabaseObject): Promise<any>
    get(query: DatabaseQuery): Promise<any>
    find(query: DatabaseQuery): Promise<any[]>
}

declare type StatusManagerOptions = {
    mode?: string
    interval?: number
    defaultStatus: Status
}

declare class StatusManager {
    constructor(bot: DataClient, databaseManager: DatabaseManager, options?: StatusManagerOptions)
    defaultStatus: Status
    current: Status
    initialize(): Promise<void>
    getStatuses(): Promise<DatabaseObject[]>
    findStatusByName(name: string): Promise<DatabaseObject[]>
    addStatus(status: Status): Promise<void>
    deleteStatus(dbStatus: DatabaseObject): Promise<void>
    setStatus(status?: Status): Promise<void>
    timerStart(): void
    timerEnd(): void
}
