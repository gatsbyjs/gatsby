/**
 * Normalize the response from "allGatsbyApiCall"
 * @param {Array} array Response from GraphQL
 * @returns {Array} Normalized Array
 */

const normalizeGatsbyApiCall = array =>
  array.map(entry => {
    const codeLocation =
      entry.nodes.length > 1
        ? entry.nodes.map(l => {
            return {
              file: l.file,
              start: { line: l.codeLocation.start.line },
              end: { line: l.codeLocation.end.line },
            }
          })
        : {
            file: entry.nodes[0].file,
            start: { line: entry.nodes[0].codeLocation.start.line },
            end: { line: entry.nodes[0].codeLocation.end.line },
          }

    return { name: entry.name, codeLocation }
  })

export default normalizeGatsbyApiCall
