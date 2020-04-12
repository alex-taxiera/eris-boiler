export function timestamp (): string {
  const now = new Date()

  return `${now.getMonth() + 1}`.padStart(2, '0') +
  '/' +
  `${now.getDate()}`.padStart(2, '0') +
  ' ' +
  `${now.getHours()}`.padStart(2, '0') +
  ':' +
  `${now.getMinutes()}`.padStart(2, '0') +
  ':' +
  `${now.getSeconds()}`.padStart(2, '0')
}
