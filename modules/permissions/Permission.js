const Permission = class Permission {
  constructor ({ name, check, deny }) {
    this.name = name
    this.check = check
    this.deny = deny
  }
}

module.exports = Permission
