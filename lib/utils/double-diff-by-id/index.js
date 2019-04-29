function doubleDiffById (...lists) {
  if (lists.length > 2) {
    throw Error('2 many lists 4 me')
  }
  return lists.reduce(
    (ax, list, index) => {
      const otherList = lists[index ? 1 : 0]
      ax.push(
        list.filter((item) => !otherList.find(({ id }) => id === item.id))
      )
      return ax
    },
    []
  )
}

module.exports = doubleDiffById
