---
title: GraphQL API
---

import { GraphqlFragmentQuery } from "../../www/src/components/api-reference/doc-static-queries"
import APIReference from "../../www/src/components/api-reference"

This doc is the API reference for GraphQL features built into Gatsby, as well as methods and procedures for customizing GraphQL for your site's needs.

## Native Gatsby Fragments

Some fragments come native with Gatsby, including fragments for returning data relevant for optimized images.

### Image Sharp Fragments

<GraphqlFragmentQuery>
  {data => <APIReference docs={data.allFile.nodes[0].childrenDocumentationJs} /> }
</GraphqlFragmentQuery>
