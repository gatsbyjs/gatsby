const grayMatter = require(`gray-matter`)

module.exports = (input, options) => {
  const matter = grayMatter(input, options.grayMatter || {})
  const { data: origData, excerpt, content } = matter
  const data = excerpt === `` ? origData : { excerpt, ...origData }
  return { data, content }
}
