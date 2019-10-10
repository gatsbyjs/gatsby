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

  // remove the defaultLayouts APIs
  if (options.defaultLayouts && isString(options.defaultLayouts)) {
    console.warn(
      `defaultLayouts in your gatsby-plugin-mdx config has no effect. Shadow the component using a file at \`gatsby-plugin-mdx/components/mdx-page.js\``
    )
  } else if (Object.keys(options.defaultLayouts).length > 0) {
    console.warn(
      `defaultLayouts in your gatsby-plugin-mdx config has no effect. Shadow the component using a file at \`gatsby-plugin-mdx/components/mdx-page.js\``
    )
  }

  optDebug(options)
  return options
}
