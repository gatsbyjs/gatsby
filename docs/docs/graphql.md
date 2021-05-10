---
title: GraphQL & Gatsby
---

When building with Gatsby, you access your data through a query language named [GraphQL](https://graphql.org/). GraphQL allows you to declaratively express your data needs. This is done with `queries`, queries are the representation of the data you need. A query looks like this:

```graphql
{
  site {
    siteMetadata {
      title
    }
  }
}
```

Which returns this:

```json
{
  "site": {
    "siteMetadata": {
      "title": "A Gatsby site!"
    }
  }
}
```

Notice how the query signature exactly matches the returned JSON signature. This is possible because in GraphQL, you query against a `schema` that is the representation of your available data. Don't worry about where the schema comes from right now, Gatsby takes care of organizing all of your data for you and making it discoverable with a tool called GraphiQL.

GraphiQL is a UI that lets you:

1. Run queries against your data in the browser;
2. Dig into the structure of data available to you through a data type explorer.

If you want to know more about GraphQL, you can read more about [why Gatsby uses it](/docs/why-gatsby-uses-graphql/) and check out this [conceptual guide](/docs/conceptual/graphql-concepts/) on querying data with GraphQL.

<GuideList slug={props.slug} />
