module.exports.print = (...input) => {
  process.stdout.write(input.join(' '))
}

module.exports.parseArgs = (rawArgs) => {
  const commandObject = rawArgs.slice(2)

  const command = commandObject[0]

  const commandArgs = commandObject.slice(1)

  return {
    command,
    args: commandArgs
  }
}
