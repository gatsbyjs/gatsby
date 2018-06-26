import { compile, tsPresetsFromJsPresets } from "./"

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
          test: TS,
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
 * GraphQL queries during build. Unfortunately
 * with the current API there is no way to affect
 * the Babel plugins which are used during that parsing.
 */
export function preprocessSource({ filename, contents }, pluginOptions) {
  if (TS.test(filename)) {
    return compile(contents, filename)
  }
  return null
}
