/* eslint-disable no-console */
const { isString, once } = require(`lodash`)
const debug = require(`debug`)(`gatsby-plugin-mdx:utils/default-options`)

const optDebug = once(options => {
  debug(`options`, options)
})

module.exports = ({ mdPlugins, hastPlugins, ...pluginOptions }) => {
  const options = Object.assign(
    {
      defaultLayouts: {},
      extensions: [`.mdx`],
      mediaTypes: [`text/markdown`, `text/x-markdown`],
      rehypePlugins: [],
      remarkPlugins: [],
      plugins: [],
      root: process.cwd(),
      gatsbyRemarkPlugins: [],
      // TODO: Remove globalScope option in next major as it's deprecated in favor of shortcodes, see https://github.com/ChristopherBiscardi/gatsby-mdx/issues/239#issuecomment-507322221
      globalScope: `export default {}`,
      shouldBlockNodeFromTransformation: () => false,
    },
    pluginOptions
  )

  if (options.gatsbyRemarkPlugins.length > 0) {
    options.gatsbyRemarkPlugins = options.gatsbyRemarkPlugins.map(plugin =>
      typeof plugin === `string` ? { resolve: plugin } : plugin
    )
  }

  // before 1.0 mdx-js/mdx called remarkPlugins mdPlugins
  // and rehypePlugins hastPlugins. This falls back for now so people don't
  // break immediately
  if (pluginOptions.hastPlugins && options.rehypePlugins.length === 0) {
    console.warn(
      `hastPlugins should be renamed to rehypePlugins in your gatsby-plugin-mdx config`
    )
    options.rehypePlugins = hastPlugins
  }
  if (pluginOptions.mdPlugins && options.remarkPlugins.length === 0) {
    console.warn(
      `mdPlugins should be renamed to remarkPlugins in your gatsby-plugin-mdx config`
    )
    options.remarkPlugins = mdPlugins
  }

  // support single layout set in the `defaultLayouts` option
  if (options.defaultLayouts && isString(options.defaultLayouts)) {
    options.defaultLayouts = {
      default: options.defaultLayouts,
    }
  }

  optDebug(options)
  return options
}
