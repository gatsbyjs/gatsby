---
title: GraphQL Query Options Reference
---

## Intro

This page will walk you through a series of GraphQL queries, each designed to demonstrate a particular feature of GraphQL. You'll be querying the _real_ schema used on [graphql-reference example](https://github.com/gatsbyjs/gatsby/tree/master/examples/graphql-reference) so feel free to experiment and poke around the innards of the site! You can also open the [Codesandbox version](https://codesandbox.io/s/github/gatsbyjs/gatsby/tree/master/examples/graphql-reference) ([Direct link to GraphiQL](<https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20site%20%7B%0A%20%20%20%20siteMetadata%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20description%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20books%3A%20allMarkdownRemark(filter%3A%20%7Bfrontmatter%3A%20%7Btitle%3A%20%7Bne%3A%20%22%22%7D%7D%7D)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(fromNow%3A%20true)%0A%20%20%20%20%20%20%20%20%20%20author%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20authors%3A%20allAuthorYaml%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20bio%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A>)) of it.

You'll be using GraphiQL, an interactive editor you can also use [while building your Gatsby site](/tutorial/part-five/#introducing-graphiql).

For more information, read about [why Gatsby uses GraphQL](/docs/why-gatsby-uses-graphql/).

## Basic query

Let's start with the basics, pulling up the site `title` from your `gatsby-config.js`'s `siteMetaData`. Here the query is on the left and the results are on the right.

<iframe title="A basic query" src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20site%20%7B%0A%20%20%20%20siteMetadata%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&explorerIsOpen=false" width="600" height="400"></iframe>

Try editing the query to include the `description` from `siteMetadata`. When typing in the query editor you can use `Ctrl + Space` to see autocomplete options and `Ctrl + Enter` to run the current query.

## A longer query

Gatsby structures its content as collections of `nodes`, which are connected to each other with `edges`. In this query you ask for the total count of plugins in this Gatsby site, along with specific information about each one.

<iframe title="A longer query" src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allSitePlugin%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%20%20version%0A%20%20%20%20%20%20%20%20packageJson%20%7B%0A%20%20%20%20%20%20%20%20%20%20description%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&explorerIsOpen=false" width="600" height="400"></iframe>

Try using the editor's autocomplete (`Ctrl + Space`) to get extended details from the `packageJson` nodes.

## Limit

There are several ways to reduce the number of results from a query. Here `totalCount` tells you there's 8 results, but `limit` is used to show only the first three.

<iframe title="Using limit" src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(limit%3A%203)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&explorerIsOpen=false" width="600" height="400"></iframe>

## Skip

Skip over a number of results. In this query `skip` is used to omit the first 3 results.

<iframe title="Using skip" src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(skip%3A%203)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&explorerIsOpen=false" width="600" height="400"></iframe>

## Filter

In this query `filter` and the `ne` (not equals) operator is used to show only results that have a title. A good video tutorial on this is [here](https://www.youtube.com/watch?v=Lg1bom99uGM).

<iframe title="Using a filter" src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7Btitle%3A%20%7Bne%3A%20%22%22%7D%7D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&explorerIsOpen=false" width="600" height="400"></iframe>

Gatsby relies on [Sift](https://www.npmjs.com/package/sift) to enable MongoDB-like query syntax for object filtering. This allows Gatsby to support operators like `eq`, `ne`, `in`, `regex` and querying nested fields through the `__` connector.

It is also possible to filter on multiple fields - just separate the individual filters by a comma (works as an AND):

```js
filter: { contentType: { in: ["post", "page"] }, draft: { eq: false } }
```

In this query the fields `categories` and `title` are filtered to find the book that has `Fantastic` in its title and belongs to the `magical creatures` category.

<iframe title="Using multiple filters" src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7B%0A%20%20%20%20%20%20%20%20categories%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20in%3A%20%5B%22magical%20creatures%22%5D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20title%3A%20%7Bregex%3A%20%22%2FFantastic%2F%22%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&explorerIsOpen=false" width="600" height="400"></iframe>

You can also combine the mentioned operators. This query filters on `/History/` for the `regex` operator. The result is `Hogwarts: A History` and `History of Magic`. You can filter out the latter with the `ne` operator.

<iframe title="Using multiple operators in filters" src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7B%0A%20%20%20%20%20%20%20%20title%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20regex%3A%20%22%2FHistory%2F%22%0A%20%20%20%20%20%20%20%20%20%20ne%3A%20%22History%20of%20Magic%22%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&explorerIsOpen=false" width="600" height="400"></iframe>

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

<iframe title="Complete list of possible operators" src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20%23%20eq%3A%20I%20want%20all%20the%20titles%20that%20match%20%22Fantastic%20Beasts%20and%20Where%20to%20Find%20Them%22%0A%20%20example_eq%3AallMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7B%0A%20%20%20%20%20%20%20%20title%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20eq%3A%20%22Fantastic%20Beasts%20and%20Where%20to%20Find%20Them%22%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20%0A%20%20%23%20neq%3A%20I%20want%20all%20the%20titles%20which%20are%20NOT%20equal%20to%20the%20empty%20string%0A%20%20example_ne%3AallMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7B%0A%20%20%20%20%20%20%20%20title%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20ne%3A%22%22%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20%0A%20%20%23%20regex%3A%20I%20want%20all%20the%20titles%20that%20do%20not%20start%20with%20%27T%27%20--%20this%20is%20what%20%2F%5E%5B%5ET%5D%2F%20means.%0A%20%20%23%20To%20learn%20more%20about%20regular%20expressions%3A%20https%3A%2F%2Fregexr.com%2F%0A%20%20example_regex%3AallMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7B%0A%20%20%20%20%20%20%20%20title%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20regex%3A%20%22%2F%5E%5B%5ET%5D%2F%22%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20%0A%20%20%23%20glob%3A%20I%20want%20all%20the%20titles%20that%20contain%20the%20word%20%27History%27.%0A%20%20%23%20The%20wildcard%20*%20stands%20for%20any%20non-empty%20string.%0A%20%20example_glob%3AallMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7B%0A%20%20%20%20%20%20%20%20title%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20glob%3A%20%22*History*%22%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20%0A%20%20%23%20in%3A%20I%20want%20all%20the%20titles%20and%20dates%20from%20%60frontmatter%60%0A%20%20%23%20where%20the%20title%20is%20either%20%0A%20%20%23%20-%20%22Children%27s%20Anthology%20of%20Monsters%22%2C%20or%0A%20%20%23%20-%20%22Hogwarts%3A%20A%20History%22.%0A%20%20example_in%3AallMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7B%0A%20%20%20%20%20%20%20%20title%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20in%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Children%27s%20Anthology%20of%20Monsters%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Hogwarts%3A%20A%20History%22%0A%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%09date%0A%20%20%20%20%20%09%09%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20%0A%20%20%23%20nin%3A%20I%20want%20all%20the%20titles%20and%20dates%20from%20%60frontmatter%60%0A%20%20%23%20where%20the%20title%20is%20neither%20%0A%20%20%23%20-%20%22Children%27s%20Anthology%20of%20Monsters%22%2C%20nor%0A%20%20%23%20-%20%22Hogwarts%3A%20A%20History%22.%0A%20%20example_nin%3AallMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7B%0A%20%20%20%20%20%20%20%20title%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20nin%3A%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Children%27s%20Anthology%20of%20Monsters%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Hogwarts%3A%20A%20History%22%0A%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%09date%0A%20%20%20%20%20%09%09%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20%0A%20%20%23%20lte%3A%20I%20want%20all%20the%20titles%20for%20which%20%60timeToRead%60%20is%20less%20than%20or%20equal%20to%204%20minutes.%0A%20%20example_lte%3AallMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20timeToRead%3A%20%7B%0A%20%20%20%20%20%20%20%20lte%3A%204%0A%20%20%20%20%20%20%7D%0A%20%20%09%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20%0A%20%20%23%20elemMatch%3A%20I%20want%20to%20know%20all%20the%20plugins%20that%20contain%20%22chokidar%22%20in%20their%20dependencies.%0A%20%20%23%20Note%3A%20the%20%60allSitePlugin%60%20query%20lists%20all%20the%20plugins%20used%20in%20our%20Gatsby%20site.%20%0A%20%20example_elemMatch%3A%20allSitePlugin(%0A%20%20%20%20filter%3A%7B%0A%20%20%20%20%20%20packageJson%3A%7B%0A%20%20%20%20%20%20%20%20dependencies%3A%7B%0A%20%20%20%20%20%20%20%20%20%20elemMatch%3A%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20name%3A%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20eq%3A%22chokidar%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%09%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%7B%0A%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&explorerIsOpen=false" width="600" height="400"></iframe>

If you want to understand more how these filters work, looking at the corresponding [tests](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/schema/__tests__/run-query.js) in the codebase could be very useful.

## Sort

The ordering of your results can be specified with `sort`. Here the results are sorted in ascending order of `frontmatter`'s `date` field.

<iframe title="Using sort" src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20sort%3A%20%7B%0A%20%20%20%20%20%20fields%3A%20%5Bfrontmatter___date%5D%0A%20%20%20%20%20%20order%3A%20ASC%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&explorerIsOpen=false" width="600" height="400"></iframe>

You can also sort on multiple fields but the `sort` keyword can only be used once. The second sort field gets evaluated when the first field (here: `date`) is identical. The results of the following query are sorted in ascending order of `date` and `title` field.

<iframe title="Sorting on multiple fields" src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20sort%3A%20%7B%0A%20%20%20%20%20%20fields%3A%20%5Bfrontmatter___date%2C%20frontmatter___title%5D%0A%20%20%20%20%20%20order%3A%20ASC%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&explorerIsOpen=false" width="600" height="400"></iframe>

`Children's Anthology of Monsters` and `Break with Banshee` both have the same date (`1992-01-02`) but in the first query (only one sort field) the latter comes after the first. The additional sorting on the `title` puts `Break with Banshee` in the right order.

By default, sort `fields` will be sorted in ascending order. Optionally, you can specify a sort `order` per field by providing an array of `ASC` (for ascending) or `DESC` (for descending) values. For example, to sort by `frontmatter.date` in ascending order, and additionally by `frontmatter.title` in descending order, you would use `sort: { fields: [frontmatter___date, frontmatter___title], order: [ASC, DESC] }`. Note that if you only provide a single sort `order` value, this will affect the first sort field only, the rest will be sorted in default ascending order.

<iframe title="Setting sorting order" src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20sort%3A%20%7B%0A%20%20%20%20%20%20fields%3A%20%5Bfrontmatter___date%2C%20frontmatter___title%5D%0A%20%20%20%20%20%20order%3A%20%5BASC%2C%20DESC%5D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&explorerIsOpen=false" width="600" height="400"></iframe>

## Format

### Dates

Dates can be formatted using the `formatString` function.

<iframe title="Formatting dates" src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20filter%3A%20%7Bfrontmatter%3A%20%7Bdate%3A%20%7Bne%3A%20null%7D%7D%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(formatString%3A%20%22dddd%20DD%20MMMM%20YYYY%22)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&explorerIsOpen=false" width="600" height="400"></iframe>

Gatsby relies on [Moment.js](https://momentjs.com/) to format the dates. This allows you to use any tokens in your string. See [moment.js documentation](https://momentjs.com/docs/#/displaying/format/) for more tokens.

You can also pass in a `locale` to adapt the output to your language. The above query gives you the english output for the weekdays, this example outputs them in german.

<iframe title="Using locale" src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20filter%3A%20%7Bfrontmatter%3A%20%7Bdate%3A%20%7Bne%3A%20null%7D%7D%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(%0A%20%20%20%20%20%20%20%20%20%20%20%20formatString%3A%20%22dddd%20DD%20MMMM%20YYYY%22%0A%20%20%20%20%20%20%20%20%20%20%20%20locale%3A%20%22de-DE%22%0A%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&explorerIsOpen=false" width="600" height="400"></iframe>

Example: [`anotherDate(formatString: "dddd, MMMM Do YYYY, h:mm:ss a") # Sunday, August 5th 2018, 10:56:14 am`](<https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(filter%3A%20%7Bfrontmatter%3A%20%7Bdate%3A%20%7Bne%3A%20null%7D%7D%7D)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(formatString%3A%20%22dddd%2C%20MMMM%20Do%20YYYY%2C%20h%3Amm%3Ass%20a%22)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A>)

Dates also accept the `fromNow` and `difference` function. The former returns a string generated with Moment.js' [`fromNow`](https://momentjs.com/docs/#/displaying/fromnow/) function, the latter returns the difference between the date and current time (using Moment.js' [`difference`](https://momentjs.com/docs/#/displaying/difference/) function).

<iframe title="Using date functions" src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20one%3A%20allMarkdownRemark(%0A%20%20%20%20filter%3A%20%7Bfrontmatter%3A%20%7Bdate%3A%20%7Bne%3A%20null%7D%7D%7D%0A%20%20%20%20limit%3A%202%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(fromNow%3A%20true)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20two%3A%20allMarkdownRemark(%0A%20%20%20%20filter%3A%20%7Bfrontmatter%3A%20%7Bdate%3A%20%7Bne%3A%20null%7D%7D%7D%0A%20%20%20%20limit%3A%202%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(difference%3A%20%22days%22)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&explorerIsOpen=false" width="600" height="400"></iframe>

### Excerpt

Excerpts accept three options: `pruneLength`, `truncate`, and `format`. `format` can be `PLAIN` or `HTML`.

<iframe title="Using excerpts" src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20filter%3A%20%7Bfrontmatter%3A%20%7Bdate%3A%20%7Bne%3A%20null%7D%7D%7D%0A%20%20%20%20limit%3A%205%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20excerpt(%0A%20%20%20%20%20%20%20%20%20%20format%3A%20PLAIN%0A%20%20%20%20%20%20%20%20%20%20pruneLength%3A%20200%0A%20%20%20%20%20%20%20%20%20%20truncate%3A%20true%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&explorerIsOpen=false" width="600" height="400"></iframe>

## Sort, filter, limit & format together

This query combines sorting, filtering, limiting and formatting together.

<iframe title="Combining sorting, filtering, limiting and formatting" src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20limit%3A%203%0A%20%20%20%20filter%3A%20%7B%20frontmatter%3A%20%7B%20date%3A%20%7B%20ne%3A%20null%20%7D%20%7D%20%7D%0A%20%20%20%20sort%3A%20%7B%20fields%3A%20%5Bfrontmatter___date%5D%2C%20order%3A%20DESC%20%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(formatString%3A%20%22dddd%20DD%20MMMM%20YYYY%22)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&explorerIsOpen=false" width="600" height="400"></iframe>

## Query variables

In addition to adding query arguments directly to queries, GraphQL allows to pass in "query variables". These can be both simple scalar values as well as objects.

The query below is the same one as the previous example, but with the input arguments passed in as "query variables".

To add variables to page component queries, pass these in the `context` object [when creating pages](/docs/creating-and-modifying-pages/#creating-pages-in-gatsby-nodejs).

<iframe title="Using query variables" src="https://711808k40x.sse.codesandbox.io/___graphql?query=query%20GetBlogPosts(%0A%20%20%24limit%3A%20Int%2C%20%24filter%3A%20MarkdownRemarkFilterInput%2C%20%24sort%3A%20MarkdownRemarkSortInput%0A)%20%7B%0A%09allMarkdownRemark(%0A%20%20%20%20limit%3A%20%24limit%2C%0A%20%20%20%20filter%3A%20%24filter%2C%0A%20%20%20%20sort%3A%20%24sort%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(formatString%3A%20%22dddd%20DD%20MMMM%20YYYY%22)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=GetBlogPosts&variables=%7B%0A%20%20%22limit%22%3A%205%2C%0A%20%20%22filter%22%3A%20%7B%0A%20%20%20%20%22frontmatter%22%3A%20%7B%0A%20%20%20%20%20%20%22date%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%22ne%22%3A%20null%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%2C%0A%20%20%22sort%22%3A%20%7B%0A%20%20%20%20%22fields%22%3A%20%22frontmatter___title%22%2C%0A%20%20%20%20%22order%22%3A%20%22DESC%22%0A%20%20%7D%0A%7D&explorerIsOpen=false" width="600" height="400"></iframe>

## Group

You can also group values on the basis of a field e.g. the title, date or category and get the field value, the total number of occurrences and edges.

The query below gets us all categories (`fieldValue`) applied to a book and how many books (`totalCount`) given category is applied to. In addition we're grabbing the `title` of books in given category. You can see for example that there are 3 books in `magical creatures` category.

<iframe title="Grouping values" src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(filter%3A%20%7Bfrontmatter%3A%20%7Btitle%3A%20%7Bne%3A%20%22%22%7D%7D%7D)%20%7B%0A%20%20%20%20group(field%3A%20frontmatter___categories)%20%7B%0A%20%20%20%20%20%20fieldValue%0A%20%20%20%20%20%20totalCount%0A%20%20%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20categories%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&explorerIsOpen=false" width="600" height="400"></iframe>

## Fragments

Fragments are a way to save frequently used queries for re-use. To create a fragment, define it in a query and export it as a named export from any file Gatsby is aware of. A fragment is available for use in any other GraphQL query, regardless of location in the project. Fragments defined in a Gatsby project are global, so names must be unique.

The query below defines a fragment to get the site title, and then uses the fragment to access this information.

<iframe title="Using fragments" src="https://711808k40x.sse.codesandbox.io/___graphql?query=fragment%20fragmentName%20on%20Site%20%7B%0A%20%20siteMetadata%20%7B%0A%20%20%20%20title%0A%20%20%7D%0A%7D%0A%0A%7B%0A%20%20site%20%7B%0A%20%20%20%20...fragmentName%0A%20%20%7D%0A%7D&explorerIsOpen=false" width="600" height="400"></iframe>

## Aliasing

Want to run two queries on the same datasource? You can do this by aliasing your queries. See below for an example:

<iframe title="Using aliases" src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20someEntries%3A%20allMarkdownRemark(skip%3A%203%2C%20limit%3A%203)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20someMoreEntries%3A%20allMarkdownRemark(limit%3A%203)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&explorerIsOpen=false" width="600" height="400"></iframe>

When you use your data, you will be able to reference it using the alias instead of the root query name. In this example, that would be `data.someEntries` or `data.someMoreEntries` instead of `data.allMarkdownRemark`.

## Where next?

Try [running your own queries](<https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20site%20%7B%0A%20%20%20%20siteMetadata%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20description%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20books%3A%20allMarkdownRemark(filter%3A%20%7Bfrontmatter%3A%20%7Btitle%3A%20%7Bne%3A%20%22%22%7D%7D%7D)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(fromNow%3A%20true)%0A%20%20%20%20%20%20%20%20%20%20author%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20authors%3A%20allAuthorYaml%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20bio%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A>), check out the rest of [the docs](/docs/) or run through [the tutorial](/tutorial/).
