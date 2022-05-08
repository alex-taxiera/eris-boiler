import {
  Client,
  CommandInteraction,
} from 'eris'

import {
  Permission as CorePermission,
  PermissionMap as CorePermissionMap,
} from '@hephaestus/core'

export interface Permission
  extends CorePermission<Client, CommandInteraction> {}

export class PermissionMap extends CorePermissionMap<Permission> {}
