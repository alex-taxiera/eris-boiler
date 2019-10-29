import {
    Client,
    Message,
    Collection,
    Member,
    ExtendedUser,
    TextChannel
} from 'eris';
/**
 * @typedef  CommandData
 * @property {string}         name        The command name.
 * @property {string}         description The command description.
 * @property {CommandAction}  run         The command function.
 * @property {CommandOptions} [options]   The command options.
 */
declare type CommandData = {
    name: string;
    description: string;
    run: CommandAction;
    options?: CommandOptions;
};

/**
 * @typedef  CommandOptions
 * @property {string[]}   [aliases=[]]                List of alias names for the command.
 * @property {string[]}   [parameters=[]]             List of paremeters that the command takes.
 * @property {Permission} [permission]                The permission threshold needed to execute this command.
 * @property {boolean}    [deleteInvoking=true]       Whether or not the bot should delete the message that invoked this command.
 * @property {boolean}    [deleteResponse=true]       Whether or not the bot should delete the message response from this command.
 * @property {number}     [deleteResponseDelay=10000] How many miliseconds to wait before deleting the bots response.
 */
declare type CommandOptions = {
    aliases?: string[];
    parameters?: string[];
    permission?: Permission;
    deleteInvoking?: boolean;
    deleteResponse?: boolean;
    deleteResponseDelay?: number;
};

/**
 * @callback CommandAction
 * @param    {CommandContext}        context The CommandContext.
 * @returns  {CommandResults|string}
 */
declare type CommandAction = (context: CommandContext) => CommandResults | string;

/**
 * @typedef  CommandContext
 * @property {string[]}   params The parsed params that make up the invoking message.
 * @property {Message}    msg    The message from Discord {@link https://abal.moe/Eris/docs/Message|(link)}.
 * @property {DataClient} bot    The bot client.
 */
declare type CommandContext = {
    params: string[];
    msg: Message;
    bot: DataClient;
};

/**
 * @typedef  CommandResults
 * @property {string} content The message content.
 */
declare type CommandResults = {
    content: string;
};

/**
 * Class representing a command.
 * @param {CommandData} data The CommandData.
 */
declare class Command {
    constructor(data: CommandData);
    /**
     * @type {string}
     */
    name: string;
    /**
     * @type {string}
     */
    description: string;
    /**
     * @type {CommandAction}
     */
    run: CommandAction;
    /**
     * @type {string[]}
     */
    aliases: string[];
    /**
     * @type {string[]}
     */
    parameters: string[];
    /**
     * @type {CommandMiddleware[]}
     */
    middleware: CommandMiddleware[];
    /**
     * @type {boolean}
     */
    deleteInvoking: boolean;
    /**
     * @type {boolean}
     */
    deleteResponse: boolean;
    /**
     * @type {number}
     */
    deleteResponseDelay: number;
    /**
     * @type {Permission}
     */
    permission: Permission;
    /**
     * @type {ExtendedMap<string, Command>}
     */
    subCommands: ExtendedMap<string, Command>;
    /**
     * @type {string}
     */
    info: string;
}

/**
 * Class reprsenting command middleware.
 * @param {CommandMiddlewareData} data The middleware data.
 */
declare class CommandMiddleware {
    constructor(data: CommandMiddlewareData);
    /**
     * @type {MiddlewareRun}
     */
    run: MiddlewareRun;
}

/**
 * @typedef  CommandMiddlewareData
 * @property {CheckFunction} [run=async () => null] The middleware runner.
 */
declare type CommandMiddlewareData = {
    run?: CheckFunction;
};

/**
 * @callback MiddlewareRun
 * @param    {CommandContext} context The CommandContext
 * @returns  {Promise<void>}
 */
declare type MiddlewareRun = (context: CommandContext) => Promise<void>;

/**
 * @typedef  DataClientOptions
 * @property {DatabaseManager}      [databaseManager]      The DatabaseManager.
 * @property {OratorOptions}        [oratorOptions]        Params to pass to the Orator class.
 * @property {StatusManagerOptions} [statusManagerOptions] StatusManagerOptions object.
 * @property {Object}               [options.erisOptions]  Options to pass to Eris Client.
 */
declare type DataClientOptions = {
    databaseManager?: DatabaseManager;
    oratorOptions?: OratorOptions;
    statusManagerOptions?: StatusManagerOptions;
};

/**
 * @typedef {string|LoadableObject|Array<string|LoadableObject>} Loadable
 */
declare type Loadable = string | LoadableObject | (string | LoadableObject)[];

/**
 * @typedef {Command|DiscordEvent|Permission} LoadableObject
 */
declare type LoadableObject = Command | DiscordEvent | Permission;

/**
 * Class representing a DataClient.
 * @extends {Client}
 * @param   {String}            token     The Discord bot token.
 * @param   {DataClientOptions} [options] The DataClient options.
 */
declare class DataClient extends Client {
    constructor(token: string, options?: DataClientOptions);
    /**
     * @type {DatabaseManager}
     */
    dbm: DatabaseManager;
    /**
     * @type {Orator}
     */
    ora: Orator;
    /**
     * @type {StatusManager}
     */
    sm: StatusManager;
    /**
     * @type {ExtendedMap<string, Command>}
     */
    commands: ExtendedMap<string, Command>;
    /**
     * @type {ExtendedMap<string, Permission>}
     */
    permissions: ExtendedMap<string, Permission>;
    /**
     * Connect to discord.
     * @returns {Promise<void>}
     */
    connect(): Promise<void>;
    /**
     * Find a command from commands.
     * @param    {string}                       name     Name of command to search.
     * @param    {ExtendedMap<string, Command>} commands A collection of commands to search instead of the build in commands.
     * @returns  {object}
     * @property {DataClient}                   bot      Current state of DataClient.
     * @property {Command}                      command  Command found from search.
     */
    findCommand(name: string, commands: ExtendedMap<string, Command>): {
        bot: DataClient;
        command: Command;
    };
    /**
     * Add commands to store.
     * @param   {...string|Command|Array<string|Command>} commands Commands to add to store.
     * @returns {DataClient}                                      Current state of DataClient.
     */
    addCommands(...commands: (string | Command | (string | Command)[])[]): DataClient;
    /**
     * Add events to store.
     * @param   {...string|DiscordEvent|Array<string|DiscordEvent>} events Events to add to store.
     * @returns {DataClient}                                              Current state of DataClient.
     */
    addEvents(...events: (string | DiscordEvent | (string | DiscordEvent)[])[]): DataClient;
    /**
     * Add permissions to store.
     * @param   {...string|Permission|Array<string|Permission>} permissions Permissions to add to store.
     * @returns {DataClient}                                               Current state of DataClient.
     */
    addPermissions(...permissions: (string | Permission | (string | Permission)[])[]): DataClient;
}

/**
 * @typedef  DatabaseManagerOptions
 * @property {DatabaseObjectBuilder} DataObject DatabaseObject constructor to structure database values.
 * @property {DatabaseQueryBuilder}  DataQuery  DatabaseQuery constructor to structure database values.
 */
declare type DatabaseManagerOptions = {
    DataObject: DatabaseObjectBuilder;
    DataQuery: DatabaseQueryBuilder;
};

/**
 * @callback DatabaseObjectBuilder
 * @param    {...any} params The params.
 * @returns  {DatabaseObject}
 */
declare type DatabaseObjectBuilder = (...params: any[]) => DatabaseObject;

/**
 * @callback DatabaseQueryBuilder
 * @param    {...any} params The params.
 * @returns  {DatabaseQuery}
 */
declare type DatabaseQueryBuilder = (...params: any[]) => DatabaseQuery;

/**
 * Class representing a database manager.
 * @interface
 * @param     {DatabaseManagerOptions} options The DatabaseManagerOptions.
 */
declare interface DatabaseManager {
    /**
     * Create a new DatabaseObject.
     * @param   {string}         type         The type of DatabaseObject to create.
     * @param   {any}            data         The data to initialize the DataObject with.
     * @param   {boolean}        [isNew=true] Whether or not the DatabaseObject should be treated as a new record.
     * @returns {DatabaseObject}              The new DatabaseObject.
     */
    newObject(type: string, data: any, isNew?: boolean): DatabaseObject;
    /**
     * Start a DatabaseQuery.
     * @param   {string}        type The type of DatabaseObject to query for.
     * @returns {DatabaseQuery}      The new DatabaseQuery.
     */
    newQuery(type: string): DatabaseQuery;
    /**
     * Add a new DatabaseObject.
     * @param   {string}       type The type of DatabaseObject to add.
     * @param   {any}          data The raw data for the new DatabaseObject.
     * @returns {Promise<any>}      The new DatabaseObject (should not need to be saved).
     */
    add(type: string, data: any): Promise<any>;
    /**
     * Delete a DatabaseObject.
     * @param   {DatabaseObject} object The DatabaseObject to delete.
     * @returns {Promise<void>}
     */
    delete(object: DatabaseObject): Promise<void>;
    /**
     * Update a Database Object.
     * @param   {DatabaseObject} object The DatabaseObject to update.
     * @returns {Promise<any>}          The raw data of the DatabaseObject.
     */
    update(object: DatabaseObject): Promise<any>;
    /**
     * Execute a DatabaseQuery that can only return a single unique DataObject.
     * @param   {DatabaseQuery} query The DatabaseQuery to execute.
     * @returns {Promise<any>}        The raw data of the DatabaseObject.
     */
    get(query: DatabaseQuery): Promise<any>;
    /**
     * Execute a DatabaseQuery.
     * @param   {DatabaseQuery}       query The DatabaseQuery to execute.
     * @returns {Promise<Array<any>>}       The raw data of the DatabaseObject(s).
     */
    find(query: DatabaseQuery): Promise<any[]>;
}

/**
 * @typedef  DatabaseObjectOptions
 * @property {boolean} [isNew=false] Whether or not to treat this as a new record.
 */
declare type DatabaseObjectOptions = {
    isNew?: boolean;
};

/**
 * Class representing a database object.
 * @param {DatabaseManager}       databaseManager The DatabaseManager.
 * @param {string}                type            The type of this DatabaseObject.
 * @param {any}                   [data={}]       The data to initialize this DataObject with.
 * @param {DatabaseObjectOptions} [options={}]    The DatabaseObjectOptions.
 */
declare class DatabaseObject {
    constructor(databaseManager: DatabaseManager, type: string, data?: any, options?: DatabaseObjectOptions);
    /**
     * @type {string}
     */
    type: string;
    /**
     * @type {string}
     */
    id: string;
    /**
     * Get a value from the DatabaseObject.
     * @param   {string} prop The name of the prop.
     * @returns {any}         The value of the prop.
     */
    get(prop: string): any;
    /**
     * Set a value of the DatabaseObject.
     * @param   {string}         prop The name of the prop.
     * @param   {any}            val  The value to set.
     * @returns {DatabaseObject}      The DatabaseObject.
     */
    set(prop: string, val: any): DatabaseObject;
    /**
     * Get a simple object representation of the DatabaseObject.
     * @returns {any} The DatabaseObject as a normal object.
     */
    toJSON(): any;
    /**
     * Delete this DatabaseObject record.
     * @returns {Promise<void>}
     */
    delete(): Promise<void>;
    /**
     * Save the DatabaseObject record.
     * @param   {any}                     data Any new data to write to the DatabaseObject before saving.
     * @returns {Promise<DatabaseObject>}      The DatabaseObject.
     */
    save(data: any): Promise<DatabaseObject>;
}

/**
 * @typedef  SubQuery
 * @property {string}        type  The type of SubQuery.
 * @property {DatabaseQuery} query The SubQuery.
 */
declare type SubQuery = {
    type: string;
    query: DatabaseQuery;
};

/**
 * Class representing a database query.
 * @param {DatabaseManager} databaseManager The DatabaseManager.
 * @param {string}          type            The type of DatabaseObject to query for.
 */
declare class DatabaseQuery {
    constructor(databaseManager: DatabaseManager, type: string);
    /**
     * @type {string}
     */
    type: string;
    /**
     * @type {number}
     */
    maxResults: number;
    /**
     * @type {any}
     */
    conditions: any;
    /**
     * @type {any}
     */
    sort: any;
    /**
     * @type {string}
     */
    getId: string;
    /**
     * @type {Array<SubQuery>}
     */
    subQueries: SubQuery[];
}

/**
 * @typedef  DiscordEventData
 * @property {string}             name      The event name.
 * @property {DiscordEventRunner} run       The function to run when the event occurs.
 */
declare type DiscordEventData = {
    name: string;
    run: DiscordEventRunner;
};

/**
 * @callback DiscordEventRunner
 * @param    {DataClient} bot  The DataClient.
 * @param    {...any}     rest The rest.
 * @returns  {void}
 */
declare type DiscordEventRunner = (bot: DataClient, ...rest: any[]) => void;

/**
 * Create an Event.
 * @param {DiscordEventData} data The EventData.
 */
declare class DiscordEvent {
    constructor(data: DiscordEventData);
    /**
     * @type {String}
     */
    name: string;
    /**
     * @type {DiscordEventRunner}
     */
    run: DiscordEventRunner;
}

/**
 * A class handling all message based communications.
 * @param {string}        defaultPrefix The default command prefix.
 * @param {OratorOptions} oratorOptions The OratorOptions.
 */
declare class Orator {
    constructor(defaultPrefix: string, oratorOptions: OratorOptions);
    /**
     * @type {string}
     */
    defaultPrefix: string;
    /**
     * @type {Array<Permission>}
     */
    permissions: Permission[];
    /**
     * Try to delete a message.
     * @param   {ExtendedUser}       me  The bot user {@link https://abal.moe/Eris/docs/ExtendedUser|(link)}.
     * @param   {Message}            msg The message to delete {@link https://abal.moe/Eris/docs/Message|(link)}.
     * @returns {Promise<void>|void}
     */
    tryMessageDelete(me: ExtendedUser, msg: Message): Promise<void> | void;
    /**
     * Try to send a message.
     * @param   {ExtendedUser}       me      The bot user {@link https://abal.moe/Eris/docs/ExtendedUser|(link)}.
     * @param   {TextChannel}        channel The channel to send the message in {@link https://abal.moe/Eris/docs/TextChannel|(link)}.
     * @param   {string|any}         content The content of the message.
     * @param   {any}                file    The file to send (if any).
     * @returns {Promise<void>|void}
     */
    tryCreateMessage(me: ExtendedUser, channel: TextChannel, content: string | any, file: any): Promise<void> | void;
    /**
     * Try to send a message.
     * @param   {ExtendedUser}  me      The bot user {@link https://abal.moe/Eris/docs/ExtendedUser|(link)}.
     * @param   {Message}       msg     The message that prompted the DM {@link https://abal.moe/Eris/docs/Message|(link)}.
     * @param   {string|any}    content The content of the message.
     * @param   {any}           file    The file to send (if any).
     * @returns {Promise<void>}
     */
    tryDMCreateMessage(me: ExtendedUser, msg: Message, content: string | any, file: any): Promise<void>;
    /**
     * Process a message read by the bot.
     * @param {DataClient} bot The bot object.
     * @param {Message}    msg The message to process {@link https://abal.moe/Eris/docs/Message|(link)}.
     */
    processMessage(bot: DataClient, msg: Message): void;
    /**
     * Check if a command can be executed in the given context.
     * @param   {CommandContext}   context The CommandContext.
     * @returns {Promise<boolean>}
     */
    hasPermission(context: CommandContext): Promise<boolean>;
}

/**
 * @typedef  OratorOptions
 * @property {string}  [defaultPrefix]             The default command prefix.
 * @property {boolean} [deleteInvoking=false]      Default behavior for whether or not the bot should delete the message that invoked a command.
 * @property {boolean} [deleteResponse=false]      Default behavior for whether or not the bot should delete the message response from a command.
 * @property {number}  [deleteResponseDelay=10000] Default behavior for how many miliseconds to wait before deleting the bots response from a command.
 */
declare type OratorOptions = {
    defaultPrefix?: string;
    deleteInvoking?: boolean;
    deleteResponse?: boolean;
    deleteResponseDelay?: number;
};

/**
 * @callback CheckFunction
 * @param    {Member}     member The Member to check permissions {@link https://abal.moe/Eris/docs/Member|(link)}.
 * @param    {DataClient} bot    The DataClient.
 * @returns  {boolean}
 */
declare type CheckFunction = (member: Member, bot: DataClient) => boolean;

/**
 * @typedef  PermissionData
 * @property {number}        [level=0] The level of the permission (0 is the bottom).
 * @property {string}        [reason='You do not have the required permissions.'] A message when a user does not meet the permission level.
 * @property {CheckFunction} [run=() => { return true }] A test to see if a member has this permission.
 */
declare type PermissionData = {
    level?: number;
    reason?: string;
    run?: CheckFunction;
};

/**
 * Class representing a permission.
 * @extends {CommandMiddleware}
 * @param   {PermissionData}    data                                                      The permission data.
 */
declare class Permission extends CommandMiddleware {
    constructor(data: PermissionData);
    /**
     * @type {MiddlewareRun}
     */
    run: MiddlewareRun;
}

declare interface RAMManager extends DatabaseManager {
}

/**
 * Class representing a database manager.
 * @implements {DatabaseManager}
 */
declare class RAMManager implements DatabaseManager {
    constructor();
    /**
     * Add a new DatabaseObject.
     * @param   {string}       type The type of DatabaseObject to add.
     * @param   {any}          data The raw data for the new DatabaseObject.
     * @returns {Promise<any>}      The new DatabaseObject (should not need to be saved).
     */
    add(type: string, data: any): Promise<any>;
    /**
     * Delete a DatabaseObject.
     * @param   {DatabaseObject} object The DatabaseObject to delete.
     * @returns {Promise<void>}
     */
    delete(object: DatabaseObject): Promise<void>;
    /**
     * Update a Database Object.
     * @param   {DatabaseObject} object The DatabaseObject to update.
     * @returns {Promise<any>}          The raw data of the DatabaseObject.
     */
    update(object: DatabaseObject): Promise<any>;
    /**
     * Execute a DatabaseQuery that can only return a single unique DataObject.
     * @param   {DatabaseQuery} query The DatabaseQuery to execute.
     * @returns {Promise<any>}        The raw data of the DatabaseObject.
     */
    get(query: DatabaseQuery): Promise<any>;
    /**
     * Execute a DatabaseQuery.
     * @param   {DatabaseQuery}       query The DatabaseQuery to execute.
     * @returns {Promise<Array<any>>}       The raw data of the DatabaseObject(s).
     */
    find(query: DatabaseQuery): Promise<any[]>;
}

/**
 * @typedef  ConnectionData
 * @property {ConnectionInfo} connectionInfo The data used to connect to the database.
 * @property {string}         client         The database driver to use.
 */
declare type ConnectionData = {
    connectionInfo: ConnectionInfo;
    client: string;
};

/**
 * @typedef  ConnectionInfo
 * @property {string} database   The database name to use.
 * @property {string} user       The user to login as.
 * @property {string} [password] The password to use to login
 * @property {string} host       The host/url/ip to connect to.
 */
declare type ConnectionInfo = {
    database: string;
    user: string;
    password?: string;
    host: string;
};

declare interface SQLManager extends DatabaseManager {
}

/**
 * Class representing an SQLDatabaseManager.
 * @implements {DatabaseManager}
 * @param      {ConnectionData}         connection   The connection data for the SQL DB.
 * @param      {DatabaseManagerOptions} [options={}] The DatabaseManagerOptions.
 */
declare class SQLManager implements DatabaseManager {
    constructor(connection: ConnectionData, options?: DatabaseManagerOptions);
    /**
     * Add a new DatabaseObject.
     * @param   {string}       type The type of DatabaseObject to add.
     * @param   {any}          data The raw data for the new DatabaseObject.
     * @returns {Promise<any>}      The new DatabaseObject (should not need to be saved).
     */
    add(type: string, data: any): Promise<any>;
    /**
     * Delete a DatabaseObject.
     * @param   {DatabaseObject} object The DatabaseObject to delete.
     * @returns {Promise<void>}
     */
    delete(object: DatabaseObject): Promise<void>;
    /**
     * Update a Database Object.
     * @param   {DatabaseObject} object The DatabaseObject to update.
     * @returns {Promise<any>}          The raw data of the DatabaseObject.
     */
    update(object: DatabaseObject): Promise<any>;
    /**
     * Execute a DatabaseQuery that can only return a single unique DataObject.
     * @param   {DatabaseQuery} query The DatabaseQuery to execute.
     * @returns {Promise<any>}        The raw data of the DatabaseObject.
     */
    get(query: DatabaseQuery): Promise<any>;
    /**
     * Execute a DatabaseQuery.
     * @param   {DatabaseQuery}       query The DatabaseQuery to execute.
     * @returns {Promise<Array<any>>}       The raw data of the DatabaseObject(s).
     */
    find(query: DatabaseQuery): Promise<any[]>;
}

/**
 * @typedef  StatusManagerOptions
 * @property {string} [mode='manual']      The mode of the StatusManager, either 'manual' or 'random'.
 * @property {number} [interval=43200000]  The amount of time to wait before randomly changing status (requires 'random' mode).
 * @property {Status} defaultStatus        The default status of the bot.
 */
declare type StatusManagerOptions = {
    mode?: string;
    interval?: number;
    defaultStatus: Status;
};

/**
 * A class representing a StatusManager.
 * @param {DataClient}           bot             The DataClient to manage.
 * @param {DatabaseManager}      databaseManager The DatabaseManager used to fetch statuses.
 * @param {StatusManagerOptions} [options={}]    StatusManagerOptions.
 */
declare class StatusManager {
    constructor(bot: DataClient, databaseManager: DatabaseManager, options?: StatusManagerOptions);
    /**
     * @type {Status}
     */
    defaultStatus: Status;
    /**
     * @type {Status}
     */
    current: Status;
    /**
     * Initialize the statuses.
     * @returns {Promise<void>}
     */
    initialize(): Promise<void>;
    /**
     * Get the statuses for this bot.
     * @returns {Promise<Array<DatabaseObject>>} The search results.
     */
    getStatuses(): Promise<DatabaseObject[]>;
    /**
     * Search for statuses by name.
     * @param   {string}                         name The name to search by.
     * @returns {Promise<Array<DatabaseObject>>}      The search results.
     */
    findStatusByName(name: string): Promise<DatabaseObject[]>;
    /**
     * Add a status record.
     * @param   {Status}        status The status to add.
     * @returns {Promise<void>}
     */
    addStatus(status: Status): Promise<void>;
    /**
     * Delete a status record.
     * @param   {DatabaseObject} dbStatus The status to delete (as a DatabaseObject).
     * @returns {Promise<void>}
     */
    deleteStatus(dbStatus: DatabaseObject): Promise<void>;
    /**
     * Set the status of the bot.
     * @param   {Status}        [status] Status to set to, if none is given and mode is random, it will randomly change.
     * @returns {Promise<void>}
     */
    setStatus(status?: Status): Promise<void>;
    /**
     * Start automatic status changing.
     * @returns {void}
     */
    timerStart(): void;
    /**
     * Stop changing status automatically.
     * @returns {void}
     */
    timerEnd(): void;
}

/**
 * @typedef {string|number} Key
 */
declare type Key = string | number;

/**
 * @callback FilterCallback
 * @param    {any}     item The item.
 * @returns  {boolean}
 */
declare type FilterCallback = (item: any) => boolean;

/**
 * @callback MapCallback
 * @param    {any} item The item.
 * @returns  {any}
 */
declare type MapCallback = (item: any) => any;

/**
 * @callback ReduceCallback
 * @param    {any} accumulator The accumulator.
 * @param    {any} item        The item.
 * @returns  {any}
 */
declare type ReduceCallback = (accumulator: any, item: any) => any;

/**
 * @extends Map<Key,T>
 */
declare class ExtendedMap<Key, T> extends Map<Key,T> {
    /**
     * Return the first object to make the function evaluate true.
     * @param   {FilterCallback} func A function that takes an object and returns true if it matches.
     * @returns {T|void}              The first matching item, or undefined if no match.
     */
    find(func: FilterCallback): T | void;
    /**
     * Return all the objects that make the function evaluate true.
     * @param   {FilterCallback} func A function that takes an object and returns true if it matches.
     * @returns {Array<T>}            An array containing all the objects that matched.
     */
    filter(func: FilterCallback): T[];
    /**
     * Return an array with the results of applying the given function to each element.
     * @param   {MapCallback} func A function that takes an object and returns something.
     * @returns {Array<any>}       An array containing the results.
     */
    map(func: MapCallback): any[];
    /**
     * Returns a value resulting from applying a function to every element of the collection.
     * @param   {ReduceCallback} func           A function that takes the previous value and the next item and returns a new value.
     * @param   {any}            [initialValue] The initial value passed to the function.
     * @returns {any}                           The final result.
     */
    reduce(func: ReduceCallback, initialValue?: any): any;
    /**
     * Returns true if all elements satisfy the condition.
     * @param   {FilterCallback} func A function that takes an object and returns true or false.
     * @returns {boolean}             Whether or not all elements satisfied the condition.
     */
    every(func: FilterCallback): boolean;
    /**
     * Returns true if at least one element satisfies the condition.
     * @param   {FilterCallback} func A function that takes an object and returns true or false.
     * @returns {boolean}             Whether or not at least one element satisfied the condition.
     */
    some(func: FilterCallback): boolean;
}

/**
 * @typedef  Status
 * @property {string} name   The name of the status.
 * @property {number} type   The data type of the status.
 */
declare type Status = {
    name: string;
    type: number;
};
