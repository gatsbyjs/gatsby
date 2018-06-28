import resolve from "./resolve"
import { transformSync } from "@babel/core"

export function tsPresetsFromJsPresets(jsPresets) {
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

const babelOptions = {
  babelrc: false,
  comments: false,
  sourceType: `unambiguous`,
  presets: [
    require.resolve(`@babel/preset-env`),
    require.resolve(`@babel/preset-react`),
    require.resolve(`@babel/preset-typescript`),
  ],
  plugins: [
    [
      require.resolve(`@babel/plugin-proposal-class-properties`),
      { loose: true },
    ],
    require.resolve(`@babel/plugin-syntax-dynamic-import`),
  ],
}

export function compile(contents, filename) {
  // preset-typescript needs the filename
  const { code } = transformSync(contents, { ...babelOptions, filename })
  return code
}
