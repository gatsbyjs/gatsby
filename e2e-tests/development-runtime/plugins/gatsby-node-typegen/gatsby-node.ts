import { GatsbyNode } from "gatsby"

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = ({ actions }) => {
  const { createTypes } = actions

  createTypes(`
    type CheckMePlease {
      hello: String!
    }
  `)
}

export const createPages: GatsbyNode["createPages"] = async ({ graphql }) => {
  await graphql<Queries.GatsbyNodeQuery>(`#graphql
    query GatsbyNode {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)
}