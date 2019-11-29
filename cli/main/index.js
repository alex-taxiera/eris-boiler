const { parseArgs, print } = require('./functions')

const {
  LoadActions,
  GetAction
} = require('./actions')

module.exports = async (args) => {
  const { command, args: cmdArgs } = parseArgs(args)

  const actions = await LoadActions()

  const action = await GetAction(actions, command)

  if (!action) {
    return print('Invalid Action')
  } else if (action.subActions && action.subActions.length > 0) {
    const subAction = action.subActions.find(({ name }) => name === cmdArgs[0])

    if (subAction) {
      await subAction.run(cmdArgs)
    } else {
      await action.run(cmdArgs)
    }
  } else {
    await action.run(cmdArgs)
  }
}
