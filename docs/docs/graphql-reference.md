---
title: GraphQL Reference
---

## Intro

This page will walk you through a series of GraphQL queries, each designed to demonstrate a particular feature of GraphQL. You'll be querying the _real_ schema used on [graphql-reference example](https://github.com/gatsbyjs/gatsby/tree/master/examples/graphql-reference) so feel free to experiment and poke around the innards of the site! You can also open the [Codesandbox version](https://codesandbox.io/s/github/gatsbyjs/gatsby/tree/master/examples/graphql-reference) of it.

You'll be using GraphiQL, an interactive editor you can also use [while building your Gatsby site](/tutorial/part-five/#introducing-graphiql).

## Basic query

Let's start with the basics, pulling up the site `title` from your `gatsby-config.js`'s `siteMetaData`. Here the query is on the left and the results are on the right.

<iframe src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20site%20%7B%0A%20%20%20%20siteMetadata%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A" width="600" height="400"></iframe>

Try editing the query to include the `description` from `siteMetadata`. When typing in the query editor you can use `Ctrl + Space` to see autocomplete options and `Ctrl + Enter` to run the current query.

## A longer query

Gatsby structures its content as collections of `nodes`, which are connected to each other with `edges`. In this query you ask for the total count of plugins in this Gatsby site, along with specific information about each one.

<iframe src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allSitePlugin%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%20%20version%0A%20%20%20%20%20%20%20%20packageJson%20%7B%0A%20%20%20%20%20%20%20%20%20%20description%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A" width="600" height="400"></iframe>

Try using the editor's autocomplete (`Ctrl + Space`) to get extended details from the `packageJson` nodes.

## Limit

There are several ways to reduce the number of results from a query. Here `totalCount` tells you there's 8 results, but `limit` is used to show only the first three.

<iframe src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(limit%3A%203)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A" width="600" height="400"></iframe>

## Skip

Skip over a number of results. In this query `skip` is used to omit the first 3 results.

<iframe src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(skip%3A%203)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A" width="600" height="400"></iframe>

## Filter

In this query `filter` and the `ne` (not equals) operator is used to show only results that have a title. A good video tutorial on this is [here](https://www.youtube.com/watch?v=Lg1bom99uGM).

<iframe src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7Btitle%3A%20%7Bne%3A%20%22%22%7D%7D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A" width="600" height="400"></iframe>

Gatsby relies on [Sift](https://www.npmjs.com/package/sift) to enable MongoDB-like query syntax for object filtering. This allows Gatsby to support operators like `eq`, `ne`, `in`, `regex` and querying nested fields through the `__` connector.

It is also possible to filter on multiple fields - just separate the individual filters by a comma (works as an AND):

```js
filter: { contentType: { in: ["post", "page"] }, draft: { eq: false } }
```

In this query the fields `categories` and `title` are filtered to find the book that has `Fantastic` in its title and belongs to the `magical creatures` category.

<iframe src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7B%0A%20%20%20%20%20%20%20%20categories%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20in%3A%20%5B%22magical%20creatures%22%5D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20title%3A%20%7Bregex%3A%20%22%2FFantastic%2F%22%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A" width="600" height="400"></iframe>

You can also combine the mentioned operators. This query filters on `/History/` for the `regex` operator. The result is `Hogwarts: A History` and `History of Magic`. You can filter out the latter with the `ne` operator.

<iframe src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7B%0A%20%20%20%20%20%20%20%20title%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20regex%3A%20%22%2FHistory%2F%22%0A%20%20%20%20%20%20%20%20%20%20ne%3A%20%22History%20of%20Magic%22%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A" width="600" height="400"></iframe>

## Sort

The ordering of your results can be specified with `sort`. Here the results are sorted in ascending order of `frontmatter`'s `date` field.

<iframe src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20sort%3A%20%7B%0A%20%20%20%20%20%20fields%3A%20%5Bfrontmatter___date%5D%0A%20%20%20%20%20%20order%3A%20ASC%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A" width="600" height="400"></iframe>

You can also sort on multiple fields but the `sort` keyword can only be used once. The second sort field gets evaluated when the first field (here: `date`) is identical. The results of the following query are sorted in ascending order of `date` and `title` field.

<iframe src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20sort%3A%20%7B%0A%20%20%20%20%20%20fields%3A%20%5Bfrontmatter___date%2C%20frontmatter___title%5D%0A%20%20%20%20%20%20order%3A%20ASC%0A%20%20%20%20%7D%0A%20%20)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A" width="600" height="400"></iframe>

`Children's Anthology of Monsters` and `Break with Banshee` both have the same date (`1992-01-02`) but in the first query (only one sort field) the latter comes after the first. The additional sorting on the `title` puts `Break with Banshee` in the right order.

## Format

### Dates

Dates can be formatted using the `formatString` function.

<iframe src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20filter%3A%20%7Bfrontmatter%3A%20%7Bdate%3A%20%7Bne%3A%20null%7D%7D%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(formatString%3A%20%22dddd%20DD%20MMMM%20YYYY%22)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A" width="600" height="400"></iframe>

Gatsby relies on [Moment.js](https://momentjs.com/) to format the dates. This allows you to use any tokens in your string. See [moment.js documentation](https://momentjs.com/docs/#/displaying/format/) for more tokens.

You can also pass in a `locale` to adapt the output to your language. The above query gives you the english output for the weekdays, this example outputs them in german.

<iframe src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20filter%3A%20%7Bfrontmatter%3A%20%7Bdate%3A%20%7Bne%3A%20null%7D%7D%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(%0A%20%20%20%20%20%20%20%20%20%20%20%20formatString%3A%20%22dddd%20DD%20MMMM%20YYYY%22%0A%20%20%20%20%20%20%20%20%20%20%20%20locale%3A%20%22de-DE%22%0A%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A" width="600" height="400"></iframe>

Example: [`anotherDate(formatString: "dddd, MMMM Do YYYY, h:mm:ss a") # Sunday, August 5th 2018, 10:56:14 am`](<https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(filter%3A%20%7Bfrontmatter%3A%20%7Bdate%3A%20%7Bne%3A%20null%7D%7D%7D)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(formatString%3A%20%22dddd%2C%20MMMM%20Do%20YYYY%2C%20h%3Amm%3Ass%20a%22)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A>)

Dates also accept the `fromNow` and `difference` function. The former returns a string generated with Moment.js' [`fromNow`](https://momentjs.com/docs/#/displaying/fromnow/) function, the latter returns the difference between the date and current time (using Moment.js' [`difference`](https://momentjs.com/docs/#/displaying/difference/) function).

<iframe src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20one%3A%20allMarkdownRemark(%0A%20%20%20%20filter%3A%20%7Bfrontmatter%3A%20%7Bdate%3A%20%7Bne%3A%20null%7D%7D%7D%0A%20%20%20%20limit%3A%202%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(fromNow%3A%20true)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20two%3A%20allMarkdownRemark(%0A%20%20%20%20filter%3A%20%7Bfrontmatter%3A%20%7Bdate%3A%20%7Bne%3A%20null%7D%7D%7D%0A%20%20%20%20limit%3A%202%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(difference%3A%20%22days%22)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A" width="600" height="400"></iframe>

### Excerpt

Excerpts accept three options: `pruneLength`, `truncate`, and `format`. `format` can be `PLAIN` or `HTML`.

<iframe src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20filter%3A%20%7Bfrontmatter%3A%20%7Bdate%3A%20%7Bne%3A%20null%7D%7D%7D%0A%20%20%20%20limit%3A%205%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20excerpt(%0A%20%20%20%20%20%20%20%20%20%20format%3A%20PLAIN%0A%20%20%20%20%20%20%20%20%20%20pruneLength%3A%20200%0A%20%20%20%20%20%20%20%20%20%20truncate%3A%20true%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A" width="600" height="400"></iframe>

## Sort, filter, limit & format together

This query combines sorting, filtering, limiting and formatting together.

<iframe src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20limit%3A%203%0A%20%20%20%20filter%3A%20%7B%20frontmatter%3A%20%7B%20date%3A%20%7B%20ne%3A%20null%20%7D%20%7D%20%7D%0A%20%20%20%20sort%3A%20%7B%20fields%3A%20%5Bfrontmatter___date%5D%2C%20order%3A%20DESC%20%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(formatString%3A%20%22dddd%20DD%20MMMM%20YYYY%22)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D" width="600" height="400"></iframe>

## Query variables

In addition to adding query arguments directly to queries, GraphQL allows to pass in "query variables". These can be both simple scalar values as well as objects.

The query below is the same one as the previous example, but with the input arguments passed in as "query variables".

To add variables to page component queries, pass these in the `context` object [when creating pages](/docs/creating-and-modifying-pages/#creating-pages-in-gatsby-nodejs).

<iframe src="https://711808k40x.sse.codesandbox.io/___graphql?query=query%20GetBlogPosts(%0A%20%20%24limit%3A%20Int%2C%20%24filter%3A%20filterMarkdownRemark%2C%20%24sort%3A%20markdownRemarkConnectionSort%0A)%20%7B%0A%09allMarkdownRemark(%0A%20%20%20%20limit%3A%20%24limit%2C%0A%20%20%20%20filter%3A%20%24filter%2C%0A%20%20%20%20sort%3A%20%24sort%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(formatString%3A%20%22dddd%20DD%20MMMM%20YYYY%22)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=GetBlogPosts&variables=%7B%0A%20%20%22limit%22%3A%205%2C%0A%20%20%22filter%22%3A%20%7B%0A%20%20%20%20%22frontmatter%22%3A%20%7B%0A%20%20%20%20%20%20%22date%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%22ne%22%3A%20null%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%2C%0A%20%20%22sort%22%3A%20%7B%0A%20%20%20%20%22fields%22%3A%20%22frontmatter___title%22%2C%0A%20%20%20%20%22order%22%3A%20%22DESC%22%0A%20%20%7D%0A%7D" width="600" height="400"></iframe>

## Group

You can also group values on the basis of a field e.g. the title, date or category and get the field value, the total number of occurrences and edges.

The query below gets us all authors (`fieldValue`) who wrote a book and how many books (`totalCount`) they wrote. In addition we're grabbing the `title` of the author's books. You can see for example that `Bathilda Bagshot` wrote three books.

<iframe src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20allMarkdownRemark(filter%3A%20%7Bfrontmatter%3A%20%7Btitle%3A%20%7Bne%3A%20%22%22%7D%7D%7D)%20%7B%0A%20%20%20%20group(field%3A%20frontmatter___author)%20%7B%0A%20%20%20%20%20%20fieldValue%0A%20%20%20%20%20%20totalCount%0A%20%20%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A" width="600" height="400"></iframe>

## Fragments

Fragments are a way to save frequently used queries for re-use. To create a fragment, define it in a query and export it as a named export from any file Gatsby is aware of. A fragment is available for use in any other GraphQL query, regardless of location in the project. Fragments defined in a Gatsby project are global, so names must be unique.

The query below defines a fragment to get the site title, and then uses the fragment to access this information.

<iframe src="https://711808k40x.sse.codesandbox.io/___graphql?query=fragment%20fragmentName%20on%20Site%20%7B%0A%20%20siteMetadata%20%7B%0A%20%20%20%20title%0A%20%20%7D%0A%7D%0A%0A%7B%0A%20%20site%20%7B%0A%20%20%20%20...fragmentName%0A%20%20%7D%0A%7D" width="600" height="400"></iframe>

## Aliasing

Want to run two queries on the same datasource? You can do this by aliasing your queries. See below for an example:

<iframe src="https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20someEntries%3A%20allMarkdownRemark(skip%3A%203%2C%20limit%3A%203)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20someMoreEntries%3A%20allMarkdownRemark(limit%3A%203)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A" width="600" height="400"></iframe>

When you use your data, you will be able to reference it using the alias instead of the root query name. In this example, that would be `data.someEntries` or `data.someMoreEntries` instead of `data.allMarkdownRemark`.

## Where next?

Try [running your own queries](<https://711808k40x.sse.codesandbox.io/___graphql?query=%7B%0A%20%20site%20%7B%0A%20%20%20%20siteMetadata%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20description%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20books%3A%20allMarkdownRemark(filter%3A%20%7Bfrontmatter%3A%20%7Btitle%3A%20%7Bne%3A%20%22%22%7D%7D%7D)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(fromNow%3A%20true)%0A%20%20%20%20%20%20%20%20%20%20author%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20authors%3A%20allAuthorYaml%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20bio%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A>), check out the rest of [the docs](/docs/) or run through [the tutorial](/tutorial/).
