import type { AnyInteractionGateway, Client } from 'oceanic.js'

import {
  Permission as CorePermission,
  PermissionAnvil as CorePermissionAnvil,
} from '@hephaestus/core'

export interface Permission
  extends CorePermission<Client, AnyInteractionGateway> {}

export class PermissionAnvil extends CorePermissionAnvil<Permission> {}
