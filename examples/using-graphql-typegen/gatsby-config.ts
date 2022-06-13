import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    title: `using-graphql-typegen`,
    siteUrl: `https://www.yourdomain.tld`,
    description: `Example project for GraphQL Typegen in Gatsby.`
  },
  graphqlTypegen: true,
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
