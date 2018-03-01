---
title: GraphQL Reference
---

> Work in progress - pull requests showing additional examples are strongly encouraged.

## Intro

This page will walk you through a series of GraphQL queries, each designed to demonstrate a particular feature of GraphQL. We're using the data from gatsbyjs.org, so feel free to experiment!

## Basic query

Let's start with the basics, pulling up the site `title` from your `gatsby-config.js`'s `siteMetaData`. Here the query is on the left and the results are on the right.

<iframe src="https://gatsbygraphql.sloppy.zone/?query=%7B%0A%20%20site%20%7B%0A%20%20%20%20siteMetadata%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D" width="600" height="400"></iframe>

Try editing the query to include the `description` from `siteMetadata`. When typing in the query editor you can use `Ctrl + Space` to see autocomplete options and `Ctrl + Enter` to run the current query.

## A longer query

Gatsby structures its content as collections of `nodes`, which are connected to each other with `edges`. In this query you ask for the total count of plugins in this Gatsby site, along with specific information about each one.

<iframe src="https://gatsbygraphql.sloppy.zone/?query=%7B%0A%20%20allSitePlugin%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%20%20version%0A%20%20%20%20%20%20%20%20packageJson%20%7B%0A%20%20%20%20%20%20%20%20%20%20description%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A" width="600" height="400"></iframe>

Try using the editor's autocomplete (`Crtl + Space`) to get extended details from the `packageJson` nodes.

## Limit

There are several ways to reduce the number of results from a query. Here `totalCount` tells you there's a few hundred results, but `limit` is used to show only the first two.

<iframe src="https://gatsbygraphql.sloppy.zone/?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20limit%3A%202%0A%20%20)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A" width="600" height="400"></iframe>

## Filter

In this query `filter` and the `ne` (not equals) operator is used to show only results that have a title.

<iframe src="https://gatsbygraphql.sloppy.zone/?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7B%20title%3A%20%7B%20ne%3A%20%22%22%20%7D%20%7D%0A%20%20%09%7D%0A%20%20)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A" width="600" height="400"></iframe>

Gatsby relies on [sift](https://www.npmjs.com/package/sift), enabling MongoDB query syntax for object filtering. This allows Gatsby to support operators like `eq`, `ne`, `in`, `regex` and querying nested fields through the `__` connector

A good video tutorial on this is [here](https://www.youtube.com/watch?v=Lg1bom99uGM).

> TODO: add more advanced examples here? Pull requests welcome!

## Sort

The ordering of your results can be specified with `sort`. Here the results are sorted in ascending order of `frontmatter`'s `date` field.

<iframe src="https://gatsbygraphql.sloppy.zone/?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20sort%3A%20%7Bfields%3A%20%5Bfrontmatter___date%5D%2C%20order%3A%20ASC%7D%2C%0A%20%20)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A%0A" width="600" height="400"></iframe>

> TODO: Can you sort on multiple fields? PR with working example query welcome!

## Format

Dates can be formatted using the `formatString` function.

<iframe src="https://gatsbygraphql.sloppy.zone/?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20filter%3A%20%7Bfrontmatter%3A%20%7Bdate%3A%20%7Bne%3A%20null%7D%7D%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(formatString%3A%20%22dddd%20DD%20MMMM%20YYYY%22)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D" width="600" height="400"></iframe>

> TODO: Expand on the possibilities of formatting - which fields can be formatted? What are the available formatting options?

## Sort, filter & limit together

This query combines sorting, filtering, limiting and formatting together.

<iframe src="https://gatsbygraphql.sloppy.zone/?query=%7B%0A%20%20allMarkdownRemark(%0A%20%20%20%20limit%3A%203%0A%20%20%20%20filter%3A%20%7B%0A%20%20%20%20%20%20frontmatter%3A%20%7Bdate%3A%20%7Bne%3A%20null%7D%7D%0A%20%20%20%20%7D%0A%20%20%20%20sort%3A%20%7Bfields%3A%20%5Bfrontmatter___date%5D%2C%20order%3A%20DESC%7D%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20fields%7B%0A%20%20%20%20%20%20%20%20%20%20slug%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20frontmatter%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20date(formatString%3A%20%22dddd%20DD%20MMMM%20YYYY%22)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D" width="600" height="400"></iframe>


## Query variables

Work in progress - pull requests welcome!
