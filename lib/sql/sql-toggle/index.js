const { inheritsMultiple } = require('../../utils')
/**
 * Class representing a Toggle.
 * @extends {Toggle}
 * @extends {SQLSetting}
 */
class SQLToggle extends inheritsMultiple(require('../sql-setting'), [require('../../toggle')]) {}

module.exports = SQLToggle
