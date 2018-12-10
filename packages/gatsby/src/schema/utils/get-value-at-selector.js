// FIXME: selector key might not exist on the obj!
// TODO: Maybe handle arrays
const getValueAtSelector = (obj, selector) => {
  const selectors = Array.isArray(selector) ? selector : selector.split(`.`)
  return selectors.reduce((acc, key) => acc[key], obj)
}

module.exports = getValueAtSelector
