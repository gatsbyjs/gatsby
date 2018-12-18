const { getValueAtSelector } = require(`../../utils`)

// FIXME: Should we ignore remaining elements in arrays of different length?
//        Currently we sort shorter arrays before longer ones. Change to
//        Math.max to reverse that behavior.
// FIXME: Should we sort `null`s to the front (or ignore them)?
//        And should we respect sort order, or always sort `null`s
//        to the front/back?
const compareValues = (a, b) => {
  if (a == null) return -1
  if (b == null) return 1

  switch (typeof a) {
    case `string`:
      return a.localeCompare(b)
    case `number`:
      return a - b
    case `object`:
      if (a instanceof Date) {
        return a - b
      }
      if (Array.isArray(a)) {
        const length = Math.min(a.length, b.length)
        let i = -1
        while (++i < length) {
          const result = compareValues(a[i], b[i])
          if (result) return result
        }
      }
      if (a instanceof String) {
        return a.localeCompare(b)
      }
      return 0
    default:
      return 0
  }
}

// const sort = ({ fields = [`id`], order = `ASC` } = {}) => {
//   const reverse = order !== `ASC` ? -1 : 1

//   const compare = (a, b, sortFields = fields) => {
//     const sortField = sortFields[0]
//     const firstValue = getValueAtSelector(a, sortField)
//     const secondValue = getValueAtSelector(b, sortField)
//     return (
//       compareValues(firstValue, secondValue) * reverse ||
//       (sortFields.length > 1 && compare(a, b, sortFields.slice(1)))
//     )
//   }
//   return compare
// }

const sort = ({ fields = [`id`], order = `ASC` } = {}) => {
  const reverse = order !== `ASC` ? -1 : 1

  const compare = (a, b, sortFields = fields) => {
    let i = -1
    while (++i < sortFields.length) {
      const sortField = sortFields[i]
      const firstValue = getValueAtSelector(a, sortField)
      const secondValue = getValueAtSelector(b, sortField)
      const result = compareValues(firstValue, secondValue) * reverse
      if (result) return result
    }
    return 0
  }
  return compare
}

// const sort = ({ fields = [`id`], order = `ASC` } = {}) => {
//   const reverse = order !== `ASC` ? -1 : 1

//   const compare = (a, b) => {
//     let result
//     fields.some(
//       field =>
//         (result = compareValues(
//           getValueAtSelector(a, field),
//           getValueAtSelector(b, field)
//         ))
//     )
//     return result * reverse
//   }
//   return compare
// }

module.exports = sort
