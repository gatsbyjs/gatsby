import { useItemList } from "./sidebar/item-list"
function flattenList(itemList) {
  return itemList.reduce((reducer, { items, ...rest }) => {
    reducer.push(rest)
    if (items) reducer.push(...flattenList(items))
    return reducer
  }, [])
}

function getSibling(index, list, direction) {
  if (direction === `next`) {
    const next = index === list.length - 1 ? null : list[index + 1]
    // for tutorial links that use subheadings on the same page skip the link and try the next item
    if (next && next.link && next.link.includes(`#`)) {
      return getSibling(index + 1, list, `next`)
    }
    return next
  } else if (direction === `prev`) {
    const prev = index === 0 ? null : list[index - 1]
    if (prev && prev.link && prev.link.includes(`#`)) {
      return getSibling(index - 1, list, `prev`)
    }
    return prev
  } else {
    reporter.warn(
      `Did not provide direction to sibling function for building next and prev links`
    )
    return null
  }
}

function findDoc(doc) {
  if (!doc.link) return null
  return (
    doc.link === this.link ||
    doc.link === this.link.substring(0, this.link.length - 1)
  )
}

export default function usePrevAndNext(path) {
  const itemList = useItemList(path)
  // No item list associated with path -- return empty
  if (!itemList) {
    return {}
  }
  const flattenedList = flattenList(itemList.items)
  // TODO locale
  const index = flattenedList.findIndex(findDoc, { link: path })
  return {
    prev: getSibling(index, flattenedList, `prev`),
    next: getSibling(index, flattenedList, `next`),
  }
}
