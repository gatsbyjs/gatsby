{pages, config, relativePath} = require 'config'
filter = require 'lodash/collection/filter'
first = require 'lodash/array/first'
includes = require 'underscore.string/include'

# Prefix links for Github Pages.
# TODO make this generic for all prefixing?
exports.link = (link) ->
  if __GH_PAGES__? and __GH_PAGES__ and config.ghPagesURLPrefix?
    return config.ghPagesURLPrefix + link
  else
    return link

# Get the child pages for a given template.
exports.templateChildrenPages = (filename, state) ->
  # Pop off the file name to leave the relative directory
  # path to this template.
  split = filename.split('/')
  split.pop()
  result = split.join('/')
  if result is ""
    result = "/"

  childrenRoutes = first(
    filter(
      state.routes, (route) -> includes route.path, result
    )
  ).childRoutes

  childrenPaths = childrenRoutes.map (path) -> path.path

  if childrenPaths
    childPages = filter pages, (page) -> page.path in childrenPaths
  else
    childPages = []

  return childPages
