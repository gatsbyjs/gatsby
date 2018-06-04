const resolve = require(`./resolve`)

function tsPresetsFromJsPresets(jsPresets) {
  const copy = (jsPresets && jsPresets.slice(0)) || []
  if (copy.length > 0) {
    const lastItem = copy[copy.length - 1]
    const lastPreset = typeof lastItem === `string` ? lastItem : lastItem[0]
    // If preset-flow is the last preset, which is the case without a custom .babelrc,
    // assume we can replace it with preset-typescript.
    if (lastPreset && lastPreset.indexOf(`@babel/preset-flow`) !== -1) {
      copy.pop()
    }
  }
  copy.push(resolve(`@babel/preset-typescript`))
  return copy
}

exports.tsPresetsFromJsPresets = tsPresetsFromJsPresets
