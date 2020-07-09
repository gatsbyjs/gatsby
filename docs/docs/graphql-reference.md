---
title: GraphQL Query Options Reference
---

import GraphqlEmbed from "@components/graphql-embed"

## Intro

This page will walk you through a series of GraphQL queries, each designed to demonstrate a particular feature of GraphQL. You'll be querying the _real_ schema used on [graphql-reference example](https://github.com/gatsbyjs/gatsby/tree/master/examples/graphql-reference) so feel free to experiment and poke around the innards of the site! You can also open the [CodeSandbox version](https://codesandbox.io/s/github/gatsbyjs/gatsby/tree/master/examples/graphql-reference) ([Direct link to GraphiQL](<https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20site%20%7B%0A%20%20%20%20siteMetadata%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20description%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20books%3A%20allMarkdownRemark(filter%3A%20%7Bfrontmatter%3A%20%7Btitle%3A%20%7Bne%3A%20%22%22%7D%7D%7D)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(fromNow%3A%20true)%0A%20%20%20%20%20%20%20%20%20%20author%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20authors%3A%20allAuthorYaml%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20bio%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A>)) of it.

You'll be using GraphiQL, an interactive editor you can also use [while building your Gatsby site](/tutorial/part-five/#introducing-graphiql).

For more information, read about [why Gatsby uses GraphQL](/docs/why-gatsby-uses-graphql/).

## Basic query

Start with the basics, pulling up the site `title` from your `gatsby-config.js`'s `siteMetadata`. Here the query is on the left and the results are on the right.

<GraphqlEmbed
  lazy
  title="A basic query"
  query={`{
  site {
    siteMetadata {
      title
    }
  }
}`}
/>

Try editing the query to include the `description` from `siteMetadata`. When typing in the query editor you can use `Ctrl + Space` to see autocomplete options and `Ctrl + Enter` to run the current query.

## A longer query

Gatsby structures its content as collections of `nodes`, which are connected to each other with `edges`. In this query you ask for the total count of plugins in this Gatsby site, along with specific information about each one.

<GraphqlEmbed
  lazy
  title="A longer query"
  query={`{
  allSitePlugin {
    totalCount
    edges {
      node {
        name
        version
        packageJson {
          description
        }
      }
    }
  }
}`}
/>

Try using the editor's autocomplete (`Ctrl + Space`) to get extended details from the `packageJson` nodes.

If you're using Gatsby version `2.2.0` or later, you can remove `edges` and `node` from your query and replace it with `nodes`. The query will still work and the returned object will reflect the `nodes` structure.

<GraphqlEmbed
  lazy
  title="A longer query with nodes"
  query={`{
  allSitePlugin {
    totalCount
    nodes {
        name
        version
        packageJson {
          description
        }
    }
  }
}`}
/>

## Limit

There are several ways to reduce the number of results from a query. Here `totalCount` tells you there's 8 results, but `limit` is used to show only the first three.

<GraphqlEmbed
  lazy
  title="Using limit"
  query={`{
  allMarkdownRemark(limit: 3) {
    totalCount
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
}`}
/>

## Skip

Skip over a number of results. In this query `skip` is used to omit the first 3 results.

<GraphqlEmbed
  lazy
  title="Using skip"
  query={`{
  allMarkdownRemark(skip: 3) {
    totalCount
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
}`}
/>

## Filter

In this query `filter` and the `ne` (not equals) operator is used to show only results that have a title. You can find a good video tutorial on this [here](https://www.youtube.com/watch?v=Lg1bom99uGM).

<GraphqlEmbed
  lazy
  title="Using a filter"
  query={`{
  allMarkdownRemark(
    filter: {
      frontmatter: {title: {ne: ""}}
    }
  ) {
    totalCount
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
}`}
/>

Gatsby relies on [Sift](https://www.npmjs.com/package/sift) to enable MongoDB-like query syntax for object filtering. This allows Gatsby to support operators like `eq`, `ne`, `in`, `regex` and querying nested fields through the `__` connector.

It is also possible to filter on multiple fields - just separate the individual filters by a comma (works as an AND):

```js
filter: { contentType: { in: ["post", "page"] }, draft: { eq: false } }
```

In this query the fields `categories` and `title` are filtered to find the book that has `Fantastic` in its title and belongs to the `magical creatures` category.

<GraphqlEmbed
  lazy
  title="Using multiple filters"
  query={`{
  allMarkdownRemark(
    filter: {
      frontmatter: {
        categories: {
          in: ["magical creatures"]
        }
        title: {regex: "/Fantastic/"
        }
      }
    }
  ) {
    totalCount
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
}`}
/>

You can also combine the mentioned operators. This query filters on `/History/` for the `regex` operator. The result is `Hogwarts: A History` and `History of Magic`. You can filter out the latter with the `ne` operator.

<GraphqlEmbed
  lazy
  title="Using multiple operators in filters"
  query={`{
  allMarkdownRemark(
    filter: {
      frontmatter: {
        title: {
          regex: "/History/"
          ne: "History of Magic"
        }
      }
    }
  ) {
    totalCount
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
}`}
/>

### Complete list of possible operators

_In the playground below the list, there is an example query with a description of what the query does for each operator._

- `eq`: short for **equal**, must match the given data exactly
- `ne`: short for **not equal**, must be different from the given data
- `regex`: short for **regular expression**, must match the given pattern. Note that backslashes need to be escaped _twice_, so `/\w+/` needs to be written as `"/\\\\w+/"`.
- `glob`: short for **global**, allows to use wildcard `*` which acts as a placeholder for any non-empty string
- `in`: short for **in array**, must be an element of the array
- `nin`: short for **not in array**, must NOT be an element of the array
- `gt`: short for **greater than**, must be greater than given value
- `gte`: short for **greater than or equal**, must be greater than or equal to given value
- `lt`: short for **less than**, must be less than given value
- `lte`: short for **less than or equal**, must be less than or equal to given value
- `elemMatch`: short for **element match**, this indicates that the field you are filtering will return an array of elements, on which you can apply a filter using the previous operators

<iframe
  title="Complete list of possible operators"
  src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20%23%20eq%3A%20I%20want%20all%20the%20titles%20that%20match%20%22Fantastic%20Beasts%20and%20Where%20to%20Find%20Them%22%0A%20%20example_eq%3AallMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7B%0A%20%20%20%20%20%20%20%20title%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20eq%3A%20%22Fantastic%20Beasts%20and%20Where%20to%20Find%20Them%22%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20%0A%20%20%23%20neq%3A%20I%20want%20all%20the%20titles%20which%20are%20NOT%20equal%20to%20the%20empty%20string%0A%20%20example_ne%3AallMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7B%0A%20%20%20%20%20%20%20%20title%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20ne%3A%22%22%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20%0A%20%20%23%20regex%3A%20I%20want%20all%20the%20titles%20that%20do%20not%20start%20with%20%27T%27%20--%20this%20is%20what%20%2F%5E%5B%5ET%5D%2F%20means.%0A%20%20%23%20To%20learn%20more%20about%20regular%20expressions%3A%20https%3A%2F%2Fregexr.com%2F%0A%20%20example_regex%3AallMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7B%0A%20%20%20%20%20%20%20%20title%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20regex%3A%20%22%2F%5E%5B%5ET%5D%2F%22%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20%0A%20%20%23%20glob%3A%20I%20want%20all%20the%20titles%20that%20contain%20the%20word%20%27History%27.%0A%20%20%23%20The%20wildcard%20*%20stands%20for%20any%20non-empty%20string.%0A%20%20example_glob%3AallMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7B%0A%20%20%20%20%20%20%20%20title%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20glob%3A%20%22*History*%22%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20%0A%20%20%23%20in%3A%20I%20want%20all%20the%20titles%20and%20dates%20from%20%60frontmatter%60%0A%20%20%23%20where%20the%20title%20is%20either%20%0A%20%20%23%20-%20%22Children%27s%20Anthology%20of%20Monsters%22%2C%20or%0A%20%20%23%20-%20%22Hogwarts%3A%20A%20History%22.%0A%20%20example_in%3AallMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7B%0A%20%20%20%20%20%20%20%20title%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20in%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Children%27s%20Anthology%20of%20Monsters%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Hogwarts%3A%20A%20History%22%0A%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%09date%0A%20%20%20%20%20%09%09%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20%0A%20%20%23%20nin%3A%20I%20want%20all%20the%20titles%20and%20dates%20from%20%60frontmatter%60%0A%20%20%23%20where%20the%20title%20is%20neither%20%0A%20%20%23%20-%20%22Children%27s%20Anthology%20of%20Monsters%22%2C%20nor%0A%20%20%23%20-%20%22Hogwarts%3A%20A%20History%22.%0A%20%20example_nin%3AallMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7B%0A%20%20%20%20%20%20%20%20title%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20nin%3A%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Children%27s%20Anthology%20of%20Monsters%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Hogwarts%3A%20A%20History%22%0A%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%09date%0A%20%20%20%20%20%09%09%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20%0A%20%20%23%20lte%3A%20I%20want%20all%20the%20titles%20for%20which%20%60timeToRead%60%20is%20less%20than%20or%20equal%20to%204%20minutes.%0A%20%20example_lte%3AallMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20timeToRead%3A%20%7B%0A%20%20%20%20%20%20%20%20lte%3A%204%0A%20%20%20%20%20%20%7D%0A%20%20%09%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20%0A%20%20%23%20elemMatch%3A%20I%20want%20to%20know%20all%20the%20plugins%20that%20contain%20%22chokidar%22%20in%20their%20dependencies.%0A%20%20%23%20Note%3A%20the%20%60allSitePlugin%60%20query%20lists%20all%20the%20plugins%20used%20in%20our%20Gatsby%20site.%20%0A%20%20example_elemMatch%3A%20allSitePlugin(%0A%20%20%20%20filter%3A%7B%0A%20%20%20%20%20%20packageJson%3A%7B%0A%20%20%20%20%20%20%20%20dependencies%3A%7B%0A%20%20%20%20%20%20%20%20%20%20elemMatch%3A%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20name%3A%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20eq%3A%22chokidar%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%09%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%7B%0A%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&explorerIsOpen=false"
  width="600"
  height="400"
  loading="lazy"
></iframe>

If you want to understand more how these filters work, looking at the corresponding [tests](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/schema/__tests__/run-query.js) in the codebase could be very useful.

## Sort

The ordering of your results can be specified with `sort`. Here the results are sorted in ascending order of `frontmatter`'s `date` field.

<GraphqlEmbed
  lazy
  title="Using sort"
  query={`{
  allMarkdownRemark(
    sort: {
      fields: [frontmatter___date]
      order: ASC
    }
  ) {
    totalCount
    edges {
      node {
        frontmatter {
          title
          date
        }
      }
    }
  }
}`}
/>

You can also sort on multiple fields but the `sort` keyword can only be used once. The second sort field gets evaluated when the first field (here: `date`) is identical. The results of the following query are sorted in ascending order of `date` and `title` field.

<GraphqlEmbed
  lazy
  title="Sorting on multiple fields"
  query={`{
  allMarkdownRemark(
    sort: {
      fields: [frontmatter___date, frontmatter___title]
      order: ASC
    }
  ) {
    totalCount
    edges {
      node {
        frontmatter {
          title
          date
        }
      }
    }
  }
}`}
/>

`Children's Anthology of Monsters` and `Break with Banshee` both have the same date (`1992-01-02`) but in the first query (only one sort field) the latter comes after the first. The additional sorting on the `title` puts `Break with Banshee` in the right order.

By default, sort `fields` will be sorted in ascending order. Optionally, you can specify a sort `order` per field by providing an array of `ASC` (for ascending) or `DESC` (for descending) values. For example, to sort by `frontmatter.date` in ascending order, and additionally by `frontmatter.title` in descending order, you would use `sort: { fields: [frontmatter___date, frontmatter___title], order: [ASC, DESC] }`. Note that if you only provide a single sort `order` value, this will affect the first sort field only, the rest will be sorted in default ascending order.

<GraphqlEmbed
  lazy
  title="Setting sorting order"
  query={`{
  allMarkdownRemark(
    sort: {
      fields: [frontmatter___date, frontmatter___title]
      order: [ASC, DESC]
    }
  ) {
    totalCount
    edges {
      node {
        frontmatter {
          title
          date
        }
      }
    }
  }
}`}
/>

## Format

### Dates

Dates can be formatted using the `formatString` function.

<GraphqlEmbed
  lazy
  title="Formatting dates"
  query={`{
  allMarkdownRemark(
    filter: {frontmatter: {date: {ne: null}}}
  ) {
    edges {
      node {
        frontmatter {
          title
          date(formatString: "dddd DD MMMM YYYY")
        }
      }
    }
  }
}`}
/>

Gatsby relies on [Moment.js](https://momentjs.com/) to format the dates. This allows you to use any tokens in your string. See [moment.js documentation](https://momentjs.com/docs/#/displaying/format/) for more tokens.

You can also pass in a `locale` to adapt the output to your language. The above query gives you the English output for the weekdays, this example outputs them in German.

<GraphqlEmbed
  lazy
  title="Using locale"
  query={`{
  allMarkdownRemark(
    filter: {frontmatter: {date: {ne: null}}}
  ) {
    edges {
      node {
        frontmatter {
          title
          date(
            formatString: "dddd DD MMMM YYYY"
            locale: "de-DE"
          )
        }
      }
    }
  }
}`}
/>

Example: [`anotherDate(formatString: "dddd, MMMM Do YYYY, h:mm:ss a") # Sunday, August 5th 2018, 10:56:14 am`](<https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(filter%3A%20%7Bfrontmatter%3A%20%7Bdate%3A%20%7Bne%3A%20null%7D%7D%7D)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(formatString%3A%20%22dddd%2C%20MMMM%20Do%20YYYY%2C%20h%3Amm%3Ass%20a%22)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A>)

Dates also accept the `fromNow` and `difference` function. The former returns a string generated with Moment.js' [`fromNow`](https://momentjs.com/docs/#/displaying/fromnow/) function, the latter returns the difference between the date and current time (using Moment.js' [`difference`](https://momentjs.com/docs/#/displaying/difference/) function).

<GraphqlEmbed
  lazy
  title="Using date functions"
  query={`{
  one: allMarkdownRemark(
    filter: {frontmatter: {date: {ne: null}}}
    limit: 2
  ) {
    edges {
      node {
        frontmatter {
          title
          date(fromNow: true)
        }
      }
    }
  }
  two: allMarkdownRemark(
    filter: {frontmatter: {date: {ne: null}}}
    limit: 2
  ) {
    edges {
      node {
        frontmatter {
          title
          date(difference: "days")
        }
      }
    }
  }
}`}
/>

### Excerpt

Excerpts accept three options: `pruneLength`, `truncate`, and `format`. `format` can be `PLAIN` or `HTML`.

<GraphqlEmbed
  lazy
  title="Using excerpts"
  query={`{
  allMarkdownRemark(
    filter: {frontmatter: {date: {ne: null}}}
    limit: 5
  ) {
    edges {
      node {
        frontmatter {
          title
        }
        excerpt(
          format: PLAIN
          pruneLength: 200
          truncate: true
        )
      }
    }
  }
}`}
/>

## Sort, filter, limit & format together

This query combines sorting, filtering, limiting and formatting together.

<GraphqlEmbed
  lazy
  title="Combining sorting, filtering, limiting and formatting"
  query={`{
  allMarkdownRemark(
    limit: 3
    filter: { frontmatter: { date: { ne: null } } }
    sort: { fields: [frontmatter___date], order: DESC }
  ) {
    edges {
      node {
        frontmatter {
          title
          date(formatString: "dddd DD MMMM YYYY")
        }
      }
    }
  }
}`}
/>

## Query variables

In addition to adding query arguments directly to queries, GraphQL allows to pass in "query variables". These can be both simple scalar values as well as objects.

The query below is the same one as the previous example, but with the input arguments passed in as "query variables".

To add variables to page component queries, pass these in the `context` object [when creating pages](/docs/creating-and-modifying-pages/#creating-pages-in-gatsby-nodejs).

<GraphqlEmbed
  lazy
  title="Using query variables"
  query={`query GetBlogPosts(
  $limit: Int, $filter: MarkdownRemarkFilterInput, $sort: MarkdownRemarkSortInput
) {
	allMarkdownRemark(
    limit: $limit,
    filter: $filter,
    sort: $sort
  ) {
    edges {
      node {
        frontmatter {
          title
          date(formatString: "dddd DD MMMM YYYY")
        }
      }
    }
  }
}`}
/>

## Group

You can also group values on the basis of a field e.g. the title, date or category and get the field value, the total number of occurrences and edges.

The query below gets you all categories (`fieldValue`) applied to a book and how many books (`totalCount`) a given category is applied to. In addition you are grabbing the `title` of books in a given category. You can see for example that there are 3 books in the `magical creatures` category.

<GraphqlEmbed
  lazy
  title="Grouping values"
  query={`{
  allMarkdownRemark(filter: {frontmatter: {title: {ne: ""}}}) {
    group(field: frontmatter___categories) {
      fieldValue
      totalCount
      edges {
        node {
          frontmatter {
            title
          }
        }
      }
    }
    nodes {
      frontmatter {
        title
        categories
      }
    }
  }
}`}
/>

## Fragments

Fragments are a way to save frequently used queries for re-use. To create a fragment, define it in a query and export it as a named export from any file Gatsby is aware of. A fragment is available for use in any other GraphQL query, regardless of its location in the project. Fragments are globally defined in a Gatsby project, so names have to be unique.

The query below defines a fragment to get the site title, and then uses the fragment to access this information.

<GraphqlEmbed
  lazy
  title="Using fragments"
  query={`fragment fragmentName on Site {
  siteMetadata {
    title
  }
}
{
  site {
    ...fragmentName
  }
}`}
/>

## Aliasing

Want to run two queries on the same datasource? You can do this by aliasing your queries. See the query below for an example:

<GraphqlEmbed
  lazy
  title="Using aliases"
  query={`{
  someEntries: allMarkdownRemark(skip: 3, limit: 3) {
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
  someMoreEntries: allMarkdownRemark(limit: 3) {
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
}`}
/>

When you use your data, you will be able to reference it using the alias instead of the root query name. In this example, that would be `data.someEntries` or `data.someMoreEntries` instead of `data.allMarkdownRemark`.

The same works for fields inside a query. Take this example:

<GraphqlEmbed
  lazy
  title="Using aliases for fields"
  query={`{
  allMarkdownRemark(skip: 3, limit: 3) {
    edges {
      node {
        frontmatter {
          header: title
          date
          relativeDate: date(fromNow: true)
        }
      }
    }
  }
}`}
/>

Instead of receiving `title` you'll get `header`. This is especially useful when you want to display the same field in different ways as the `date` shows. You both get `date` and `relativeDate` from the same source.

## Conditionals

GraphQL allows you to skip a piece of a query depending on variables. This is handy when you need to render some part of a page conditionally.

Try changing variable `withDate` in the example query below:

<GraphqlEmbed
  lazy
  title="Using conditionals"
  query={`query GetBlogPosts ($withDate:Boolean = false) {
  allMarkdownRemark(limit: 3, skip: 1) {
    edges {
      node {
        frontmatter {
          title
          date @include(if:$withDate)
        }
      }
    }
  }
}`}
/>

Use directive `@include(if: $variable)` to conditionally include a part of a query or `@skip(if: $variable)` to exclude it.

You can use those directives on any level of the query and even on fragments. Take a look at an advanced example:

<GraphqlEmbed
  lazy
  title="Using conditionals: Advanced"
  query={`query GetBlogPosts ($preview:Boolean = true) {
    allMarkdownRemark(limit: 3, skip: 1) {
      edges {
        node {
          ...BlogPost @skip(if:$preview)
          ...BlogPostPreview @include(if:$preview)
        }
      }
    }
    allFile(limit:2) @skip(if:$preview) {
      edges {
        node {
          relativePath
        }
      }
    }
  }
  fragment BlogPost on MarkdownRemark {
    html
    frontmatter {
      title
      date
    }
  }
  fragment BlogPostPreview on MarkdownRemark {
    excerpt
    frontmatter {
      title
    }
}`}
/>

## Where next?

Try [running your own queries](<https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20site%20%7B%0A%20%20%20%20siteMetadata%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20description%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20books%3A%20allMarkdownRemark(filter%3A%20%7Bfrontmatter%3A%20%7Btitle%3A%20%7Bne%3A%20%22%22%7D%7D%7D)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(fromNow%3A%20true)%0A%20%20%20%20%20%20%20%20%20%20author%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20authors%3A%20allAuthorYaml%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20bio%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A>), check out the rest of [the docs](/docs/) or run through [the tutorial](/tutorial/).
