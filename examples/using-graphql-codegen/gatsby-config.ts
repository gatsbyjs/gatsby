import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    title: `graphql-typegen-testing`,
    siteUrl: `https://www.yourdomain.tld`,
    description: `A testing project for a new upcoming feature.`
  },
  flags: {
    GRAPHQL_TYPEGEN: true,
  },
  plugins: [
    `gatsby-transformer-remark`, 
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `./src/pages/`
      }
    }
  ]
};

export default config
