import {
  Client,
  CommandInteraction,
} from 'eris'

import {
  Permission as CorePermission,
  PermissionAnvil as CorePermissionAnvil,
} from '@hephaestus/core'

export interface Permission
  extends CorePermission<Client, CommandInteraction, unknown> {}

export class PermissionAnvil extends CorePermissionAnvil<Permission> {}
