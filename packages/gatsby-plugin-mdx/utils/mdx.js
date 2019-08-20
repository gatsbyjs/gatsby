const mdx = require(`@mdx-js/mdx`)
const grayMatterWrapper = require(`./gray-matter-wrapper`)
/**
 * Converts MDX to JSX, including converting classic frontmatter to an
 * exported variable.
 *
 * @param  {String} source  MDX source
 * @param  {Object} options options for mdx library
 * @return {String}         JSX source
 */
module.exports = async function mdxToJsx(source, options) {
  const { data, content } = grayMatterWrapper(source, options || {})

  let code = await mdx(content, options || {})

  return `${code}

export const _frontmatter = ${JSON.stringify(data)};
`
}
