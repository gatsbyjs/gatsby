import * as path from "path"
import * as fs from "fs-extra"
import { createContentDigest } from "gatsby-core-utils"
import { addRemoteFilePolyfillInterface } from "gatsby-plugin-utils/polyfill-remote-file"
import type { GatsbyNode } from "gatsby"
import slicesData from "./shared-data/slices"

export const onPreBootstrap: GatsbyNode["onPreBootstrap"] = () => {
  fs.copyFileSync(
    `./src/templates/static-page-from-cache.js`,
    `./.cache/static-page-from-cache.js`
  )
}

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = ({
  actions,
  schema,
}) => {
  const { createTypes } = actions
  const typeDefs = `
      type Product implements Node {
          name: String
      }
    `
  createTypes(typeDefs)

  actions.createTypes(
    addRemoteFilePolyfillInterface(
      schema.buildObjectType({
        name: "MyRemoteFile",
        fields: {},
        interfaces: ["Node", "RemoteFile"],
      }),
      {
        schema,
        actions,
      }
    )
  )

  actions.createTypes(`#graphql
    type HeadFunctionExportFsRouteApi implements Node {
      id: ID!
      slug: String!
      content: String!
    }
  `)
}

const products = ["Burger", "Chicken"]

export const sourceNodes: GatsbyNode["sourceNodes"] = ({
  actions,
  createNodeId,
}) => {
  products.forEach((product, i) => {
    actions.createNode({
      id: createNodeId(i.toString()),
      children: [],
      parent: null,
      internal: {
        type: `Product`,
        contentDigest: createContentDigest(product),
      },
      name: product,
    })
  })

  const items = [
    {
      name: "photoA.jpg",
      url:
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2000&q=80",
      placeholderUrl:
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=%width%&h=%height%",
      mimeType: "image/jpg",
      filename: "photo-1517849845537.jpg",
      width: 2000,
      height: 2667,
    },
    {
      name: "photoB.jpg",
      url:
        "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=2000&q=10",
      mimeType: "image/jpg",
      filename: "photo-1552053831.jpg",
      width: 1247,
      height: 2000,
    },
    {
      name: "photoC.jpg",
      url:
        "https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2000&q=80",
      placeholderUrl:
        "https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=%width%&h=%height%",
      mimeType: "image/jpg",
      filename: "photo-1561037404.jpg",
      width: 2000,
      height: 1333,
    },
  ]

  items.forEach((item, index) => {
    actions.createNode({
      id: createNodeId(`remote-file-${index}`),
      ...item,
      internal: {
        type: "MyRemoteFile",
        contentDigest: createContentDigest(item.url),
      },
    })
  })

  actions.createNode({
    id: createNodeId(`head-function-export-fs-route-api`),
    slug: `/fs-route-api`,
    parent: null,
    children: [],
    internal: {
      type: `HeadFunctionExportFsRouteApi`,
      content: `Some words`,
      contentDigest: createContentDigest(`Some words`),
    },
  })
}

export const createPages: GatsbyNode["createPages"] = ({
  actions: { createPage, createRedirect, createSlice },
}) => {

  //-------------------------Slices API----------------------------
  createSlice({
    id: `footer`,
    component: path.resolve(`./src/components/footer.js`),
    context: {
      framework: slicesData.framework
    },
  })

  createSlice({
    id: `mappedslice-fakeid`,
    component: path.resolve(`./src/components/mapped-slice.js`),
  })

  slicesData.allRecipeAuthors.forEach(({ id, name }) => {
    createSlice({
      id: `author-${id}`,
      component: path.resolve(`./src/components/recipe-author.js`),
      context: {
        name,
        id,
      },
    })
  })

  slicesData.allRecipes.forEach(({ authorId, id, name, description }) => {
    createPage({
      path: `/recipe/${id}`,
      component: path.resolve(`./src/templates/recipe.js`),
      context: {
        description: description,
        name,
      },
      slices: {
        author: `author-${authorId}`,
      },
    })
  })

  //---------------------------------------------------------------

  createPage({
    path: `/안녕`,
    component: path.resolve(`src/pages/page-2.js`),
  })

  createPage({
    path: `/한글-URL`,
    component: path.resolve(`src/pages/page-2.js`),
    defer: true,
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

  {
    const searchParamComponent = path.resolve(
      `src/templates/search-param-render.js`
    )

    createPage({
      path: `/slashes/no-trailing`,
      component: searchParamComponent,
    })

    createPage({
      path: `/slashes/with-trailing/`,
      component: searchParamComponent,
    })
  }

  createRedirect({
    fromPath: "/pagina-larga/",
    toPath: "/long-page/",
    isPermanent: true,
    redirectInBrowser: true,
    ignoreCase: false,
  })

  createRedirect({
    fromPath: "/Longue-Page/",
    toPath: "/long-page/",
    isPermanent: true,
    redirectInBrowser: true,
    ignoreCase: true,
  })

  createRedirect({
    fromPath: `/redirect-two/`,
    toPath: `/redirect-search-hash/`,
    isPermanent: true,
    redirectInBrowser: true,
  })
}

export const onCreatePage: GatsbyNode["onCreatePage"] = ({ page, actions }) => {
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
    case `/404/`: {
      actions.createPage({
        ...page,
        slices: { mappedslice: "mappedslice-fakeid" },
      })
      break
    }
  }
}
