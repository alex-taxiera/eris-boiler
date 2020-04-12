export function addLeadingZeroes (num: number, maxLength: number = 2): string {
  let str = num.toString()

  if (str.length < maxLength) {
    str = '0'.repeat(maxLength - str.length) + str
  }

  return str
}
