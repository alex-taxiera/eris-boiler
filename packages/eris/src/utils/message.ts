import {
  Message,
  PrivateChannel,
  TextChannel,
  ExtendedUser,
  MessageContent,
  FileContent,
  User,
  TextableChannel,
} from 'eris'

import { logger } from '@hephaestus/utils'

import { isInGuild } from './channel'
import {
  canSend,
  canDelete,
} from './permissions'

export async function createMessage (
  me: ExtendedUser,
  channel: TextChannel,
  content: MessageContent,
  file?: FileContent | FileContent[],
): Promise<Message<TextChannel> | undefined> {
  if (canSend(me.id, channel)) {
    try {
      return await channel.createMessage(content, file)
    } catch (error) {
      logger.warn(`Failed to send: ${(error as Error).toString()}`)
    }
  }
}

export async function createDirectMessage (
  me: ExtendedUser,
  recipient: User,
  content: MessageContent,
  options?: {
    file?: FileContent | FileContent[]
  }
): Promise<Message<PrivateChannel> | undefined>
export async function createDirectMessage (
  me: ExtendedUser,
  recipient: User,
  content: MessageContent,
  options: {
    file?: FileContent | FileContent[]
    notifyChannel: TextableChannel
  }
): Promise<Message<typeof options['notifyChannel']> | undefined>
export async function createDirectMessage (
  me: ExtendedUser,
  recipient: User,
  content: MessageContent,
  options: {
    file?: FileContent | FileContent[]
    notifyChannel?: TextableChannel
  } = {},
): Promise<Message<TextableChannel> | undefined> {
  let success = false
  try {
    const dmChannel = await recipient.getDMChannel()
    const dmMessage = await dmChannel.createMessage(content, options.file)

    if (!options.notifyChannel) {
      return dmMessage
    }

    success = true
  } catch (error) {
    logger.warn(`Failed to send DM: ${(error as Error).toString()}`)
  }

  const notification = {
    content: success ? 'DM sent.' : content,
    file: success ? undefined : options.file,
  }

  if (options.notifyChannel && isInGuild(options.notifyChannel)) {
    return await createMessage(
      me,
      options.notifyChannel,
      notification.content,
      notification.file,
    )
  }

  return await createDirectMessage(me, recipient, notification.content, {
    file: notification.file,
  })
}

export function deleteMessage (
  me: ExtendedUser,
  message: Message,
): Promise<void> | void {
  if (canDelete(me.id, message)) {
    return message.delete()
      .catch((error) => {
        logger.warn(`Failed to Delete ${(error as Error).toString()}`)
      })
  }
}
