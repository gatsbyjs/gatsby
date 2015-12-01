import frontMatter from 'front-matter'
import markdownIt from 'markdown-it'
import hljs from 'highlight.js'
import _ from 'underscore'

const highlight = (str, lang) => {
  if ((lang !== null) && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(lang, str).value
    } catch (_error ) {
      console.error(_error)
    }
  }
  try {
    return hljs.highlightAuto(str).value
  } catch (_error ) {
    console.error(_error)
  }
  return ''
}

const md = markdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: highlight,
})

module.exports = function (content) {
  let body
  this.cacheable()
  const meta = frontMatter(content)
  body = md.render(meta.body)
  const result = _.extend({}, meta.attributes, {
    body: body,
  })
  this.value = result
  return 'module.exports = ' + JSON.stringify(result)
}
