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

function colorize (level: LEVEL, text: string): string {
  const codes = inspect.colors[level]

  return codes ? `\x1b[${codes[0]}m${text}\x1b[${codes[1]}m` : text
}

function write (stream: NodeJS.WriteStream, level: LEVEL, text: string): void {
  const time = timestamp()

  stream.write(Buffer.from(
    `${time} | ${formatWithOptions({ colors: true }, colorize(level, text))}\n`
  ))
}

export function log (
  content: Content,
  level: LEVEL = LEVEL.DEFAULT
): void {
  return write(process.stdout, level, content.join(' '))
}

export function error (
  ...content: Content
): void {
  return write(process.stderr, LEVEL.ERROR, content.join(' '))
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
