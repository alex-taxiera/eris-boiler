import {
  Message,
  PrivateChannel,
  GroupChannel,
  TextChannel,
  NewsChannel,
  TextableChannel,
} from 'eris'

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
