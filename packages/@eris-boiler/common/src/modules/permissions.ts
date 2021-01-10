import { KnownKeys } from '@utils/type'
import {
  TextChannel,
  Constants,
  Message,
} from 'eris'
import { isInGuild } from './message'

export type PermissionKeys = Array<KnownKeys<Constants['Permissions']>>

export const requiredSendPermissions: PermissionKeys = [
  'readMessages',
  'sendMessages',
]
export const requiredDeletePermissions: PermissionKeys = [
  'manageMessages',
]

export function checkChannelPermissions (
  memberId: string,
  channel: TextChannel,
  permissions: PermissionKeys,
): boolean {
  const permission = channel.permissionsOf(memberId)
  return permissions.every((perm) => permission.has(perm))
}

export function canSend (memberId: string, channel: TextChannel): boolean {
  return checkChannelPermissions(memberId, channel, requiredSendPermissions)
}

export function canDelete (memberId: string, message: Message): boolean {
  return memberId === message.author.id || (
    isInGuild(message) &&
    checkChannelPermissions(
      memberId,
      message.channel,
      requiredDeletePermissions,
    )
  )
}
