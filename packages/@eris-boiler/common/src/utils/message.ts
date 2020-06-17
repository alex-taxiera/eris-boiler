import {
  Message,
  PrivateChannel,
  GroupChannel,
  TextChannel,
  NewsChannel,
} from 'eris'

export function isInDM (
  message: Message,
): message is Message<PrivateChannel> {
  return message.channel.type === 0 || message.channel.type === 3
}

export function isInGroupDM (
  message: Message,
): message is Message<GroupChannel> {
  return message.channel.type === 3
}

export function isInGuild (
  message: Message,
): message is Message<TextChannel> {
  return message.channel.type === 1 || message.channel.type === 5
}

export function isInNews (
  message: Message,
): message is Message<NewsChannel> {
  return message.channel.type === 5
}
