import {
  inspect,
  formatWithOptions,
} from 'util'

import {
  timestamp,
} from '@helpers/time'

type Content = Array<any>

export enum LEVEL {
  SUCCESS = 'green',
  WARN = 'yellow',
  ERROR = 'red',
  INFO = 'cyan',
  DEFAULT = 'white'
}

/**
 * @param content An array of things to log
 * @param level   The log level
 * @param stream  The WriteStream to use
 */
export function log (
  content: Content,
  level: LEVEL = LEVEL.DEFAULT,
  stream: NodeJS.WriteStream = process.stdout,
): void {
  const time = timestamp()
  const codes = inspect.colors[level]
  const text = content.join(' ')
  const message = codes ? `\x1b[${codes[0]}m${text}\x1b[${codes[1]}m` : text

  stream.write(Buffer.from(
    `${time} | ${formatWithOptions({ colors: true }, message)}\n`,
  ))
}

/**
 * @param content The stuff to log, can be anything, use like console.log
 */
export function error (
  ...content: Content
): void {
  return log(content, LEVEL.ERROR, process.stderr)
}

/**
 * @param content The stuff to log, can be anything, use like console.log
 */
export function info (
  ...content: Content
): void {
  return log(content, LEVEL.INFO)
}

/**
 * @param content The stuff to log, can be anything, use like console.log
 */
export function success (
  ...content: Content
): void {
  return log(content, LEVEL.SUCCESS)
}

/**
 * @param content The stuff to log, can be anything, use like console.log
 */
export function warn (
  ...content: Content
): void {
  return log(content, LEVEL.WARN)
}
