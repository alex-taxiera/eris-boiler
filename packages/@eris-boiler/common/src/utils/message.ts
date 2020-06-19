import {
  Message,
  PrivateChannel,
  GroupChannel,
  TextChannel,
  NewsChannel,
  ExtendedUser,
  MessageContent,
  MessageFile,
  User,
  TextableChannel,
} from 'eris'
import {
  canSend,
  canDelete,
} from '@utils/permissions'
import * as logger from '@modules/logger'

export function isInDM (
  subject: TextableChannel,
): subject is PrivateChannel
export function isInDM (
  subject: Message,
): subject is Message<PrivateChannel>
export function isInDM (
  subject: Message | TextableChannel,
): subject is Message<PrivateChannel> | PrivateChannel {
  if (subject.constructor === Message) {
    return subject.channel.type === 0 || subject.channel.type === 3
  }

  return subject.type === 0 || subject.type === 3
}

export function isInGroupDM (
  subject: TextableChannel,
): subject is GroupChannel
export function isInGroupDM (
  subject: Message,
): subject is Message<GroupChannel>
export function isInGroupDM (
  subject: Message | TextableChannel,
): subject is Message<GroupChannel> | GroupChannel {
  if (subject.constructor === Message) {
    return subject.channel.type === 3
  }

  return subject.type === 3
}

export function isInGuild (
  subject: TextableChannel,
): subject is TextChannel
export function isInGuild (
  subject: Message,
): subject is Message<TextChannel>
export function isInGuild (
  subject: Message | TextableChannel,
): subject is Message<TextChannel> | TextChannel {
  if (subject.constructor === Message) {
    return subject.channel.type === 1 || subject.channel.type === 5
  }

  return subject.type === 1 || subject.type === 5
}

export function isInNews (
  subject: NewsChannel,
): subject is NewsChannel
export function isInNews (
  subject: Message,
): subject is Message<NewsChannel>
export function isInNews (
  subject: Message | NewsChannel,
): subject is Message<NewsChannel> | NewsChannel {
  if (subject.constructor === Message) {
    return subject.channel.type === 5
  }

  return subject.type === 5
}

export function createMessage (
  me: ExtendedUser,
  channel: TextChannel,
  content: MessageContent,
  file?: MessageFile | Array<MessageFile>,
): Promise<Message<TextChannel> | void> | void {
  if (canSend(me.id, channel)) {
    return channel.createMessage(content, file)
      .catch((error) => {
        logger.warn(`Failed to send: ${(error as Error).toString()}`)
      })
  }
}

export async function createDirectMessage (
  me: ExtendedUser,
  recipient: User,
  content: MessageContent,
  options?: {
    file?: MessageFile | Array<MessageFile>
  }
): Promise<Message<PrivateChannel> | void>
export async function createDirectMessage (
  me: ExtendedUser,
  recipient: User,
  content: MessageContent,
  options: {
    file?: MessageFile | Array<MessageFile>
    notifyChannel: TextableChannel
  }
): Promise<Message<typeof options['notifyChannel']> | void>
export async function createDirectMessage (
  me: ExtendedUser,
  recipient: User,
  content: MessageContent,
  options: {
    file?: MessageFile | Array<MessageFile>
    notifyChannel?: TextableChannel
  } = {},
): Promise<Message<TextableChannel> | void> {
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
    return
  }

  const notification = {
    content: success ? 'DM sent.' : content,
    file: success ? undefined : options.file,
  }

  if (isInGuild(options.notifyChannel)) {
    return createMessage(
      me,
      options.notifyChannel,
      notification.content,
      notification.file,
    )
  }

  return createDirectMessage(me, recipient, notification.content, {
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
