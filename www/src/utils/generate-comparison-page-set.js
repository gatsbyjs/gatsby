/**
 * generate all the potential pages for the features pages
 * @param {string} type feature type of either cms or jamstack
 * @returns {object[]} array of objects with options, type, and page path
 */

const _ = require(`lodash`)
const featureComparisonOptions = require(`../data/features/comparison-options.json`)

// create power sets of all possible feature comparison options:
// adapted from https://github.com/acarl005/generatorics
function* generatePowerSet(arr) {
  const length = arr.length
  let options = []

  yield* powerUtil(0, 0)
  function* powerUtil(start, index) {
    options.length = index
    yield options
    if (index === length) return
    for (let i = start; i < length; i++) {
      options[index] = arr[i]
      yield* powerUtil(i + 1, index + 1)
    }
  }
  return options
}

const generateComparisonPageSet = type => {
  let pages = []
  for (const set of generatePowerSet(
    featureComparisonOptions[type].map(option => option.key)
  )) {
    if (set.length > 0) {
      const optionSet = [...set]
      const options = _.filter(featureComparisonOptions[type], o =>
        optionSet.includes(o.key)
      )
      pages.push({
        options,
        featureType: type,
        path: `/features/${type}/gatsby-vs-${set.join(`-vs-`)}`,
      })
    }
  }
  return pages
}

module.exports = { generateComparisonPageSet }
