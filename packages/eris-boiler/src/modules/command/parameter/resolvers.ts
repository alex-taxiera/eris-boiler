import {
  ArgResolver,
} from './base'

export const intResolver: ArgResolver<number> = (str) => {
  const num = parseInt(str)

  return isNaN(num) ? undefined : num
}

export const floatResolver: ArgResolver<number> = (str) => {
  const num = parseFloat(str)

  return isNaN(num) ? undefined : num
}

export const booleanResolver: ArgResolver<boolean> = (str) => {
  const test = str.toLowerCase()

  return (test === 'y' || test === 'yes' || test === 'true')
    ? true
    : (test === 'n' || test === 'no' || test === 'false')
      ? false
      : undefined
}
