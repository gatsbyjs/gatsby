---
title: Introducing GraphiQL
---

In this guide, you'll be learning to use something called GraphiQL, a tool that helps you structure GraphQL queries correctly.

## What is GraphiQL?

GraphiQL is the GraphQL integrated development environment (IDE). It's a powerful (and all-around awesome) tool
you'll use often while building Gatsby websites.

You can access it when your site's development server is running--normally at
`http://localhost:8000/___graphql`.

## Example of using GraphiQL

When you have `http://localhost:8000/___graphql` open, it will look something like what this video shows. In the video below, watch someone poke around the built-in `Site` "type" and see what fields are available
on it—including the `siteMetadata` object.

<video controls="controls" autoplay="true" loop="true">
  <source type="video/mp4" src="/graphiql-explore.mp4" />
  <p>Your browser does not support the video element.</p>
</video>

## How to use GraphiQL

When the development server is running for one of your Gatsby sites, open GraphiQL at `http://localhost:8000/___graphql` and play with your data! Press <kbd>Ctrl + Space</kbd> (or use <kbd>Shift + Space</kbd> as an alternate keyboard shortcut) to bring up the autocomplete window and <kbd>Ctrl + Enter</kbd> to run the GraphQL query.

Make sure to check out the GraphiQL docs in the upper right-hand corner of the IDE. It's easy to miss them, but they're worth visiting!

![A diagram pointing out where to find the GraphiQL docs](../../images/graphiql-docs.png)

## Using the GraphiQL Explorer

The GraphiQL Explorer enables you to interactively construct full queries by clicking through available fields and inputs without the repetitive process of typing these queries out by hand.

<EggheadEmbed
  lessonLink="https://egghead.io/lessons/gatsby-build-a-graphql-query-using-gatsby-s-graphiql-explorer"
  lessonTitle="Build a GraphQL Query using Gatsby’s GraphiQL Explorer"
/>

Read more [about the GraphiQL Explorer](/blog/2019-06-03-integrating-graphiql-explorer/) on the Gatsby blog.

## Enable Refresh Content Button

The environment variable `ENABLE_GATSBY_REFRESH_ENDPOINT` enables a "Refresh Data" button which allows you to refresh the sourced content. See [Refreshing Content](/docs/refreshing-content/).

## Other resources

- See [Tutorial Part 5: Source Plugins](/docs/tutorial/part-five/) for a more complete example of using GraphiQL
- See the [README for GraphiQL](https://github.com/graphql/graphiql)
- See [Using GraphQL Playground](/docs/using-graphql-playground/) for another example of a GraphQL IDE
