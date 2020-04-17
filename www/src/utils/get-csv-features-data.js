/**
 * Splits data from the Features query into more manageable data structures"
 * @param {Array} data Nodes in response from GraphQL
 * @returns {Object} headers and sections for features tables
 */

export const getFeaturesData = function (data) {
  const sections = (data || [])
    .map((row, i) => (row.Category ? i : -1))
    .filter(rowNum => rowNum !== -1)
    .map((rowNum, i, arr) => {
      if (i < arr.length - 1) {
        return [rowNum, arr[i + 1]]
      }

      return [rowNum, data.length]
    })
    .map(bounds => data.slice(bounds[0], bounds[1]))

  const sectionHeaders = (data || [])
    .filter(row => row.Category)
    .map(row => row.Category)

  return {
    sectionHeaders,
    sections,
  }
}
