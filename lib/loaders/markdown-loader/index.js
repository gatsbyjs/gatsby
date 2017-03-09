/* @flow weak */
import frontMatter from 'front-matter'
import markdownIt from 'markdown-it'
import hljs from 'highlight.js'
import objectAssign from 'object-assign'
import path from 'path'
import loaderUtils from 'loader-utils'

const highlight = (str, lang) => {
  if ((lang !== null) && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(lang, str).value
    } catch (_error) {
      console.error(_error)
    }
  }
  try {
    return hljs.highlightAuto(str).value
  } catch (_error) {
    console.error(_error)
  }
  return ''
}

const md = linkPrefix => markdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight,
  replaceLink: (link) => {
    if (process.env.PREFIX_LINKS === 'prefix-links' && path.isAbsolute(link)) {
      return linkPrefix + link
    }
    return link
  },
})
  .use(require('markdown-it-replace-link'))

module.exports = function (content) {
  this.cacheable()

  const config = loaderUtils.parseQuery(this.query).config
  const linkPrefix = config.linkPrefix || ''

  const meta = frontMatter(content)
  const body = md(linkPrefix).render(meta.body)
  const result = objectAssign({}, meta.attributes, {
    body,
  })
  this.value = result
  return `module.exports = ${JSON.stringify(result)}`
}
