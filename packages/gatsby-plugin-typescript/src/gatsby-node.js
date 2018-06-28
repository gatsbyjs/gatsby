import { tsPresetsFromJsPresets, PARSER_OPTIONS } from "./"

const TS = /\.tsx?$/
export const resolvableExtensions = () => [`.ts`, `.tsx`]

export function onCreateWebpackConfig({ actions, loaders, stage }) {
  const jsLoader = loaders.js()
  if (
    !(
      jsLoader &&
      jsLoader.loader &&
      jsLoader.options &&
      jsLoader.options.presets
    )
  ) {
    return
  }
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: jsLoader.loader,
              options: {
                ...jsLoader.options,
                presets: tsPresetsFromJsPresets(jsLoader.options.presets),
              },
            },
          ],
        },
      ],
    },
  })
}

/**
 * Gatsby uses preprocessSource when it parses
 * GraphQL queries during build.
 */
export function preprocessSource({ filename, contents }, pluginOptions) {
  if (TS.test(filename)) {
    return PARSER_OPTIONS
  }
  return null
}
