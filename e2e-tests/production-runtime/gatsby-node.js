const path = require(`path`)
const fs = require(`fs-extra`)
const { createContentDigest } = require(`gatsby-core-utils`)

exports.onPreBootstrap = () => {
  fs.copyFileSync(
    `./src/templates/static-page-from-cache.js`,
    `./.cache/static-page-from-cache.js`
  )
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
      type Product implements Node {
          name: String
      }
    `
  createTypes(typeDefs)
}

const products = ["Burger", "Chicken"]

exports.sourceNodes = ({ actions, createNodeId }) => {
  products.forEach((product, i) => {
    actions.createNode({
      id: createNodeId(i),
      children: [],
      parent: null,
      internal: {
        type: `Product`,
        contentDigest: createContentDigest(product),
      },
      name: product,
    })
  })
}

exports.createPages = ({ actions: { createPage, createRedirect } }) => {
  createPage({
    path: `/안녕`,
    component: path.resolve(`src/pages/page-2.js`),
  })

  createPage({
    path: `/foo/@something/bar`,
    component: path.resolve(`src/pages/page-2.js`),
  })

  createPage({
    path: `/client-only-paths/static`,
    component: path.resolve(`src/templates/static-page.js`),
  })

  // 4 pages that will test prioritization of static pages that also match
  // matchPage page with wildcard
  createPage({
    path: `/app/`,
    component: path.resolve(`src/templates/custom-dom-marker.js`),
    context: {
      domMarker: `app-index-1`,
    },
  })

  createPage({
    path: `/A-app-glob/`,
    matchPath: `/app/*`,
    component: path.resolve(`src/templates/custom-dom-marker.js`),
    context: {
      domMarker: `app-wildcard-1`,
    },
  })

  createPage({
    path: `/B-app-glob/`,
    matchPath: `/app2/*`,
    component: path.resolve(`src/templates/custom-dom-marker.js`),
    context: {
      domMarker: `app-wildcard-2`,
    },
  })

  createPage({
    path: `/app2/`,
    component: path.resolve(`src/templates/custom-dom-marker.js`),
    context: {
      domMarker: `app-index-2`,
    },
  })

  // 3 pages that will test prioritization of static pages that also match
  // matchPage page with named parameters
  createPage({
    path: `/event/2019/10/26/test-event/`,
    component: path.resolve(`src/templates/custom-dom-marker.js`),
    context: {
      domMarker: `static-event-1`,
    },
  })

  createPage({
    path: `/event/`,
    matchPath: `/event/:year/:month/:day/:slug`,
    component: path.resolve(`src/templates/custom-dom-marker.js`),
    context: {
      domMarker: `dynamic-event`,
    },
  })

  createPage({
    path: `/event/2019/10/28/test-event/`,
    component: path.resolve(`src/templates/custom-dom-marker.js`),
    context: {
      domMarker: `static-event-2`,
    },
  })

  // page that is a mix of named parameters and wildcard
  createPage({
    path: `/event-2/`,
    matchPath: `/event/:year/:month/*`,
    component: path.resolve(`src/templates/custom-dom-marker.js`),
    context: {
      domMarker: `dynamic-and-wildcard`,
    },
  })

  createPage({
    path: `/page-from-cache/`,
    component: path.resolve(`./.cache/static-page-from-cache.js`),
  })

  createRedirect({
    fromPath: "/pagina-larga",
    toPath: "/long-page",
    isPermanent: true,
    redirectInBrowser: true,
    ignoreCase: false,
  })

  createRedirect({
    fromPath: "/Longue-Page",
    toPath: "/long-page",
    isPermanent: true,
    redirectInBrowser: true,
    ignoreCase: true,
  })
}

exports.onCreatePage = ({ page, actions }) => {
  switch (page.path) {
    case `/client-only-paths/`:
      // create client-only-paths
      page.matchPath = `/client-only-paths/*`
      actions.createPage(page)
      break

    case `/`:
      // use index page as template
      // (mimics)
      actions.createPage({
        ...page,
        path: `/duplicated`,
        context: {
          DOMMarker: `duplicated`,
        },
      })
      break
  }
}
