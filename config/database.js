const buildDBConfig = (config) => [
  {
    name: 'guild_settings',
    columns: [
      {
        name: 'id',
        type: 'string',
        primary: true,
        default: undefined
      }, {
        name: 'vip',
        type: 'string',
        primary: false,
        default: undefined
      }, {
        name: 'prefix',
        type: 'string',
        primary: false,
        default: config.DEFAULT.prefix
      }
    ],
    insert: undefined
  }, {
    name: 'guild_toggles',
    columns: [
      {
        name: 'id',
        type: 'string',
        primary: true,
        default: undefined
      }
    ],
    insert: undefined
  }, {
    name: 'statuses',
    columns: [
      {
        name: 'name',
        type: 'string',
        primary: true,
        default: undefined
      }, {
        name: 'type',
        type: 'integer',
        primary: false,
        default: 0
      }, {
        name: 'default',
        type: 'boolean',
        primary: false,
        default: false
      }
    ],
    insert: [
      {
        name: 'Overwatch',
        type: 0,
        default: true
      }
    ]
  }
]

module.exports = buildDBConfig
