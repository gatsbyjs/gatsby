import GatsBy from "gatsby"
import { dirname } from "path"
import { fileURLToPath } from "url"
import gfm from "remark-gfm"

const __dirname = dirname(fileURLToPath(import.meta.url))

/**@type {GatsBy.GatsbyConfig} */
const config = {
  siteMetadata: {
    title: `mjs`,
    siteUrl: `https://www.yourdomain.tld`,
  },
  plugins: [
    {
      resolve: "gatsby-plugin-mdx",
      options: {
        mdxOptions: {
          remarkPlugins: [gfm],
        },
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/pages`,
      },
    },
  ],
}
export default config
