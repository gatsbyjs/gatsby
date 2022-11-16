import { GatsbyNode } from "gatsby"

/*
If you know that certain types will definitely exist, you can define types which will result in TS types not being nullable. By defining SiteMetadata here the types in src/pages/completed.tsx for siteMetadata.title are of type string, not string | null
*/

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = ({ actions }) => {
  actions.createTypes(`
    type Site {
      siteMetadata: SiteMetadata!
    }

    type SiteMetadata {
      title: String!
      siteUrl: String!
      description: String!
    }
  `)
}