import * as path from "path"
import type { GatsbyNode, GatsbyConfig } from "gatsby"
import { addRemoteFilePolyfillInterface } from "gatsby-plugin-utils/polyfill-remote-file"
import { applyTrailingSlashOption } from "./utils"

const TRAILING_SLASH = (process.env.TRAILING_SLASH ||
  `never`) as GatsbyConfig["trailingSlash"]

export const createPages: GatsbyNode["createPages"] = async ({
  actions: { createPage, createRedirect, createSlice },
  graphql,
}) => {
  const { data: ImageCDNRemoteFileFromPageContextData } = await graphql(`
    query ImageCDNGatsbyNode {
      allMyRemoteImage {
        nodes {
          id
          url
          filename
          publicUrl
          resize(width: 100) {
            height
            width
            src
          }
          fixed: gatsbyImage(
            layout: FIXED
            width: 100
            placeholder: DOMINANT_COLOR
          )
          constrained: gatsbyImage(
            layout: CONSTRAINED
            width: 300
            placeholder: BLURRED
          )
          constrained_traced: gatsbyImage(
            layout: CONSTRAINED
            width: 300
            placeholder: TRACED_SVG
          )
          full: gatsbyImage(layout: FULL_WIDTH, width: 500, placeholder: NONE)
        }
      }
      allMyRemoteFile {
        nodes {
          id
          url
          filename
          publicUrl
          isAllowed
        }
      }
    }
  `)

  createPage({
    path: applyTrailingSlashOption(
      `/routes/ssg/remote-file-data-from-context/`,
      TRAILING_SLASH
    ),
    component: path.resolve(`./src/templates/remote-file-from-context.jsx`),
    context: ImageCDNRemoteFileFromPageContextData,
  })

  createRedirect({
    fromPath: applyTrailingSlashOption("/redirect", TRAILING_SLASH),
    toPath: applyTrailingSlashOption("/routes/redirect/hit", TRAILING_SLASH),
  })
  createRedirect({
    fromPath: applyTrailingSlashOption(
      "/routes/redirect/existing",
      TRAILING_SLASH
    ),
    toPath: applyTrailingSlashOption("/routes/redirect/hit", TRAILING_SLASH),
  })
  createRedirect({
    fromPath: applyTrailingSlashOption(
      "/routes/redirect/existing-force",
      TRAILING_SLASH
    ),
    toPath: applyTrailingSlashOption("/routes/redirect/hit", TRAILING_SLASH),
    force: true,
  })
  createRedirect({
    fromPath: applyTrailingSlashOption(
      "/routes/redirect/country-condition",
      TRAILING_SLASH
    ),
    toPath: applyTrailingSlashOption("/routes/redirect/hit-us", TRAILING_SLASH),
    conditions: {
      country: ["us"],
    },
  })
  createRedirect({
    fromPath: applyTrailingSlashOption(
      "/routes/redirect/country-condition",
      TRAILING_SLASH
    ),
    toPath: applyTrailingSlashOption("/routes/redirect/hit-de", TRAILING_SLASH),
    conditions: {
      country: ["de"],
    },
  })
  // fallback if not matching a country condition
  createRedirect({
    fromPath: applyTrailingSlashOption(
      "/routes/redirect/country-condition",
      TRAILING_SLASH
    ),
    toPath: applyTrailingSlashOption("/routes/redirect/hit", TRAILING_SLASH),
  })

  createSlice({
    id: `footer`,
    component: path.resolve(`./src/components/footer.jsx`),
    context: {},
  })
}

// Image CDN
export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] =
  function createSchemaCustomization({ actions, schema, store }) {
    actions.createTypes(
      addRemoteFilePolyfillInterface(
        schema.buildObjectType({
          name: "MyRemoteImage",
          fields: {},
          interfaces: ["Node", "RemoteFile"],
        }),
        {
          schema,
          actions,
          store,
        }
      )
    )

    actions.createTypes(
      addRemoteFilePolyfillInterface(
        schema.buildObjectType({
          name: "MyRemoteFile",
          fields: {
            isAllowed: `String!`,
          },
          interfaces: ["Node", "RemoteFile"],
        }),
        {
          schema,
          actions,
          store,
        }
      )
    )

    if (typeof actions.addRemoteFileAllowedUrl === `function`) {
      actions.addRemoteFileAllowedUrl([
        `https://images.unsplash.com/*`,
        `https://www.gatsbyjs.com/*`,
      ])
    }
  }

export const sourceNodes: GatsbyNode["sourceNodes"] = function sourceNodes({
  actions,
  createNodeId,
  createContentDigest,
}) {
  const items = [
    {
      name: "photoA.jpg",
      url: "https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2000&q=80",
      placeholderUrl:
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=%width%&h=%height%",
      mimeType: "image/jpg",
      filename: "photo-1517849845537.jpg",
      width: 2000,
      height: 2667,
    },
    {
      name: "photoB.jpg",
      url: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=2000&q=10",
      mimeType: "image/jpg",
      filename: "photo-1552053831.jpg",
      width: 1247,
      height: 2000,
    },
    {
      name: "photoC.jpg",
      url: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2000&q=80",
      placeholderUrl:
        "https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=%width%&h=%height%",
      mimeType: "image/jpg",
      filename: "photo-1561037404.jpg",
      width: 2000,
      height: 1333,
    },
    {
      // svg is not considered for image cdn - file cdn will be used
      name: "fileA.svg",
      url: "https://www.gatsbyjs.com/Gatsby-Logo.svg",
      mimeType: "image/svg+xml",
      filename: "Gatsby-Logo.svg",
      type: `MyRemoteFile`,
      isAllowed: true,
    },
    {
      // svg is not considered for image cdn - file cdn will be used
      name: "fileB.svg",
      url: "https://www.not-allowed.com/not-allowed.svg",
      mimeType: "image/svg+xml",
      filename: "Gatsby-Logo.svg",
      type: `MyRemoteFile`,
      isAllowed: false,
    },
  ]

  items.forEach((item, index) => {
    actions.createNode({
      id: createNodeId(`remote-file-${index}`),
      ...item,
      internal: {
        type: item.type ?? "MyRemoteImage",
        contentDigest: createContentDigest(item.url),
      },
    })
  })
}
