import path from "path"
import { GatsbyConfig } from "gatsby"
import { moreDataConfig } from "../utils/more-data-config-ts"
import { siteMetadata } from "../utils/site-metadata-ts"

const { title, siteUrl } = siteMetadata

const config: GatsbyConfig = {
  pathPrefix: `/blog`,
  siteMetadata: {
    title,
    siteUrl,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `dune`,
        // `${__dirname}/data` not working
        path: `./data`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `hp`,
        path: path.resolve(`resolve-data`),
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        // require.resolve(`./src/images`) not working, see https://github.com/parcel-bundler/parcel/issues/6925
        path: path.resolve(`src/images`),
      },
    },
    moreDataConfig,
    `gatsby-transformer-yaml`,
    `gatsby-plugin-sitemap`
  ]
}

export default config