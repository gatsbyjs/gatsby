---
title: GraphQL API
---

import { graphql } from "gatsby"

This doc is the API reference for GraphQL features built into Gatsby, as well as methods and procedures for customizing GraphQL for your site's needs.

export const pageQuery = graphql`query { allFile(filter: {relativePath: {in: ["gatsby-transformer-sharp/src/fragments.js"]}}) { nodes { relativePath childrenDocumentationJs { name description { id childMdx { rawBody } } codeLocation { start { line } end { line } } } } } }`
