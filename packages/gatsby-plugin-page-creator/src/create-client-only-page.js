const { createPath } = require(`gatsby-page-utils`)

// Changes something like
//   `/Users/site/src/pages/foo/[id]/`
// to
//   `/foo/:id`
function translateInterpolationToMatchPath(createdPath) {
  const [, path] = createdPath.split(`src/pages`)
  return path.replace(`[`, `:`).replace(`]`, ``).replace(/\/$/, ``)
}

exports.createClientOnlyPage = function createClientOnlyPage(
  absolutePath,
  actions
) {
  console.log(`client only`, absolutePath)

  // Create page object
  const createdPath = createPath(absolutePath)
  const matchPath = translateInterpolationToMatchPath(createdPath)

  const page = {
    path: createdPath,
    matchPath: matchPath,
    component: absolutePath,
  }

  // Add page
  actions.createPage(page)
}
