const Command = class Command {
  constructor ({ name, description, parameters, permission, run }) {
    this.name = name
    this.description = description
    this.parameters = parameters
    this.permission = permission
    this.run = run
  }
}

module.exports = Command
