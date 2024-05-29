import type { GatsbyConfig } from "gatsby"
import debugAdapter from "./debug-adapter"
import { siteDescription, title } from "./constants"

const shouldUseDebugAdapter = process.env.USE_DEBUG_ADAPTER ?? false
const trailingSlash = (process.env.TRAILING_SLASH ||
  `never`) as GatsbyConfig["trailingSlash"]
const pathPrefix = (process.env.PATH_PREFIX ||
  undefined) as GatsbyConfig["pathPrefix"]

let configOverrides: GatsbyConfig = {}

// Should conditionally add debug adapter to config
if (shouldUseDebugAdapter) {
  configOverrides = {
    adapter: debugAdapter(),
  }
} else {
  process.env.GATSBY_ADAPTERS_MANIFEST = /* javascript */ `
    module.exports = [
      {
        name: 'Netlify',
        module: 'gatsby-adapter-netlify',
        test: () => !!process.env.NETLIFY || !!process.env.NETLIFY_LOCAL,
        versions: [
          {
            gatsbyVersion: '*',
            moduleVersion: '*',
          }
        ],
      }
    ]
  `
}

const config: GatsbyConfig = {
  siteMetadata: {
    title,
    siteDescription,
  },
  trailingSlash,
  pathPrefix,
  plugins: [
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
  ],
  headers: [
    {
      source: `/*`,
      headers: [
        {
          key: "x-custom-header",
          value: "my custom header value",
        },
      ],
    },
    {
      source: `routes/ssr/*`,
      headers: [
        {
          key: "x-ssr-header",
          value: "my custom header value from config",
        },
        {
          key: "x-ssr-header-overwrite",
          value: "config wins",
        },
      ],
    },
    {
      source: `routes/dsg/*`,
      headers: [
        {
          key: "x-dsg-header",
          value: "my custom header value",
        },
      ],
    },
    {
      source: `routes/ssg/*`,
      headers: [
        {
          key: "x-ssg-header",
          value: "my custom header value",
        },
      ],
    },
  ],
  ...configOverrides,
}

export default config
