import * as path from "path"
import type { GatsbyNode, GatsbyConfig } from "gatsby"
import * as fs from "fs-extra"

import { applyTrailingSlashOption } from "./utils"

const TRAILING_SLASH = (process.env.TRAILING_SLASH ||
  `never`) as GatsbyConfig["trailingSlash"]

export const createPages: GatsbyNode["createPages"] = async ({
  actions: { createRedirect, createSlice, createPage },
  graphql,
}) => {
  const { data, errors } = await graphql(`
    {
      allMyRemoteFile {
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
    }
  `)

  if (errors) {
    console.error(errors)
    process.exit(1)
  }

  createPage({
    path: `/routes/remote-file-context`,
    component: path.resolve(`./src/templates/remote-file-context.jsx`),
    context: {
      remoteFile: data,
    },
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

// export const onPostBuild = () => {
//   const appendToNetlifyToml = `
//   [images]
//   remote_images = ["https://images.unsplash.com/*"]

//   [[redirects]]
//   from = "/test"
//   to = "/routes/remote-file"
//   status = 301
//   force = true
//   `

//   fs.appendFileSync("./netlify.toml", appendToNetlifyToml)
// }
