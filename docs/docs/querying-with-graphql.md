---
title: Querying data with GraphQL
---

There are many options for loading data into React components. One of the most
popular and powerful of these is a technology called
[GraphQL](http://graphql.org/).

GraphQL was invented at Facebook to help product engineers _pull_ needed data into
React components.

GraphQL is a **q**uery **l**anguage (the _QL_ part of its name). If you're
familiar with SQL, it works in a very similar way. Using a special syntax, you describe
the data you want in your component and then that data is given
to you.

Gatsby uses GraphQL to enable [page and layout
components](/docs/building-with-components/) to declare what data they and their
sub-components need. Gatsby then handles making sure that data is available in
the browser when needed by your components.

## What does a GraphQL query look like?

GraphQL lets you ask for the exact data you need. Queries look like JSON:

```graphql
{
  site {
    siteMetadata {
      title
    }
  }
}
```

Which returns:

```json
{
  "site": {
    "siteMetadata": {
      "title": "A Gatsby site!"
    }
  }
}
```

A basic page component with a GraphQL query might look like this:

```jsx
import React from "react";

export default ({ data }) => (
  <div>
    <h1>About {data.site.siteMetadata.title}</h1>
    <p>We're a very cool website you should return to often.</p>
  </div>
);

export const query = graphql`
  query AboutQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`;
```

The result of the query is automatically inserted into your React component
on the `data` prop. GraphQL and Gatsby lets you ask for data and then
immediately start using it.

## How to learn GraphQL

Gatsby might be the first time you've seen GraphQL! We hope you love it as much
as we do and find it useful for all your projects.

When starting out with GraphQL, we recommend the following two tutorials:

* https://www.howtographql.com/
* http://graphql.org/learn/

[The official Gatsby tutorial](/tutorial/part-four/) also includes an introduction to using GraphQL specifically with Gatsby.

## How does GraphQL and Gatsby work together?

One of the great things about GraphQL is how flexible it is. People use GraphQL
with [many different programming languages](http://graphql.org/code/) and for web and native apps.

Most people using GraphQL run it on a server to respond live to requests for
data from clients. You define a schema (a schema is a formal way of describing
the shape of your data) for your GraphQL server and then your GraphQL resolvers
retrieve data from databases and/or other APIs.

Gatsby is unique that it uses GraphQL at _build-time_ and _not_ for live
sites. This means you don't need to run additional services (e.g. a database
and node.js service) to use GraphQL for production websites.

Gatsby is a great framework for building apps so it's possible and encouraged
to pair Gatsby's native build-time GraphQL with GraphQL queries running against
a live GraphQL server from the browser.

## Where does Gatsby's GraphQL schema come from?

Most usages of GraphQL involve manually creating a GraphQL schema.

With Gatsby, we instead use plugins which fetch data from different sources
which we use to automatically _infer_ a GraphQL schema.

If you give Gatsby data that looks like:

```json
{
  "title": "A long long time ago"
}
```

Gatsby will create a schema that looks something like:

```
title: String
```

This makes it easy to pull data from anywhere and immediately start writing
GraphQL queries against your data.

This _can_ cause confusion though as some data sources allow you to define
a schema but parts of that schema might still not be recreated in Gatsby if
there's not yet any data added for that part of the schema.

## Powerful data transformations

GraphQL enables another unique feature of Gatsby — it lets you control data transformations with arguments to your queries. Some examples.

### Formatting dates

People often store dates like "2018-01-05" but want to display the date in some other form like "January 5th, 2018". One way of doing this is to load a date formatting JavaScript library into the browser. With Gatsby's GraphQL layer you can instead do the formatting at query time like:

```graphql
{
  date(formatString: "MMMM Do, YYYY")
}
```

### Markdown

Gatsby has _transformer_ plugins which can transform data from one form to another. A common example is markdown. If you install [`gatsby-transformer-remark`](/packages/gatsby-transformer-remark/) then in your queries, you can specify you want the transformed HTML version instead of markdown:

```graphql
markdownRemark {
  html
}
```

### Images

Gatsby has rich support for processing images. Responsive images are a big part of the modern web and typically involve creating 5+ sized thumbnails per photo. With Gatsby's [`gatsby-transformer-sharp`](/packages/gatsby-transformer-sharp/), you can _query_ your images for responsive versions. The query automatically creates all the needed responsive thumbnails and returns `src` and `srcSet` fields to add to your image element.

Combined with a special Gatsby image component, [gatsby-image](/packages/gatsby-image/), you have a very powerful set of primatives for building sites with images.

See also the following blog posts:

* [Making Website Building Fun](/blog/2017-10-16-making-website-building-fun/)
* [Image Optimization Made Easy with Gatsby.js](https://medium.com/@kyle.robert.gill/ridiculously-easy-image-optimization-with-gatsby-js-59d48e15db6e)

## Further reading

### Getting started with GraphQL

* http://graphql.org/learn/
* https://www.howtographql.com/
* https://reactjs.org/blog/2015/05/01/graphql-introduction.html
* https://services.github.com/on-demand/graphql/

### Advanced readings on GraphQL

* [GraphQL specification](https://facebook.github.io/graphql/October2016/)
* [Interfaces and Unions](https://medium.com/the-graphqlhub/graphql-tour-interfaces-and-unions-7dd5be35de0d)
* [Relay Compiler (which Gatsby uses to process queries)](https://facebook.github.io/relay/docs/en/compiler-architecture.html)
