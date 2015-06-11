fs = require 'fs'
frontMatter = require 'front-matter'
MarkdownIt = require 'markdown-it'
hljs = require 'highlight.js'
_ = require 'underscore'

highlight = (str, lang) ->
  if lang? and hljs.getLanguage(lang)
    try
      return hljs.highlight(lang, str).value
    catch

  try
    return hljs.highlightAuto(str).value
  catch

  return ''

md = MarkdownIt({
  html: true
  linkify: true
  typographer: true
  highlight: highlight
})

module.exports = (content) ->
  @cacheable()

  content = frontMatter(content)
  body = md.render(content.body)
  content = _.extend {}, content.attributes, body: body

  @value = content
  return 'module.exports = ' + JSON.stringify(content)
