import { pages, config } from 'config'
import filter from 'lodash/filter'
import first from 'lodash/head'
import includes from 'underscore.string/include'

// Prefix links for Github Pages.
// TODO make this generic for all prefixing?
const link = exports.link = function (_link) {
  if ((typeof __PREFIX_LINKS__ !== 'undefined' && __PREFIX_LINKS__ !== null) && __PREFIX_LINKS__ && (config.linkPrefix !== null)) {
    return config.linkPrefix + _link
  } else {
    return _link
  }
}

// Get the child pages for a given template.
exports.templateChildrenPages = function (filename, state) {
  // Pop off the file name to leave the relative directory
  // path to this template.
  const split = filename.split('/')
  split.pop()
  let result = '/' + split.join('/')

  result = link(result)

  const childrenRoutes = head(
    filter(
      state.routes, function (route) {
        return includes(route.path, result)
      }
    )
  ).childRoutes

  const childrenPaths = childrenRoutes.map(function (path) {
    return path.path
  })

  let childPages
  if (childrenPaths) {
    childPages = filter(pages, function (page) {
      return childrenPaths.indexOf(link(page.path)) >= 0
    })
  } else {
    childPages = []
  }

  return childPages
}
