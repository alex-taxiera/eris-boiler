import {
  inspect,
  formatWithOptions
} from 'util'

import {
  timestamp
} from '@helpers/time'

type Content = Array<any>

export enum LEVEL {
  SUCCESS = 'green',
  WARN = 'yellow',
  ERROR = 'red',
  INFO = 'cyan',
  DEFAULT = 'white'
}

export function log (
  content: Content,
  level: LEVEL = LEVEL.DEFAULT,
  stream: NodeJS.WriteStream = process.stdout
): void {
  const time = timestamp()
  const codes = inspect.colors[level]
  const text = content.join(' ')
  const message = codes ? `\x1b[${codes[0]}m${text}\x1b[${codes[1]}m` : text

  stream.write(Buffer.from(
    `${time} | ${formatWithOptions({ colors: true }, message)}\n`
  ))
}

export function error (
  ...content: Content
): void {
  return log(content, LEVEL.ERROR, process.stderr)
}

export function info (
  ...content: Content
): void {
  return log(content, LEVEL.INFO)
}

export function success (
  ...content: Content
): void {
  return log(content, LEVEL.SUCCESS)
}

export function warn (
  ...content: Content
): void {
  return log(content, LEVEL.WARN)
}
