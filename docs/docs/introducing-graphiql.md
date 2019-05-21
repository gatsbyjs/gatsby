---
title: Introducing GraphiQL
---

In this guide, you'll be learning to use something called Graph_i_QL, a tool that helps you structure GraphQL queries correctly.

## What is Graph_i_QL?

Graph_i_QL is the GraphQL integrated development environment (IDE). It's a powerful (and all-around awesome) tool
you'll use often while building Gatsby websites.

You can access it when your site's development server is running--normally at
<http://localhost:8000/___graphql>.

## Example of using Graph_i_QL

When you have <http://localhost:8000/___graphql> open, it will look something like what this video shows. In the video below, watch someone poke around the built-in `Site` "type" and see what fields are available
on it—including the `siteMetadata` object.

<video controls="controls" autoplay="true" loop="true">
  <source type="video/mp4" src="/graphiql-explore.mp4"></source>
  <p>Your browser does not support the video element.</p>
</video>

## How to use Graph_i_QL

When the development server is running for one of your Gatsby sites, open Graph_i_QL at <http://localhost:8000/___graphql> and play with your data! Press <kbd>Ctrl + Space</kbd> (or use <kbd>Shift + Space</kbd> as an alternate keyboard shortcut) to bring up the autocomplete window and <kbd>Ctrl + Enter</kbd> to run the GraphQL query.

Make sure to check out the Graph_i_QL docs in the upper right-hand corner of the IDE. It's easy to miss them, but they're worth visiting!

![A diagram pointing out where to find the GraphiQl docs](images/graphiql-docs.png)

## Other resources

- See [Tutorial Part 5: Source Plugins](/tutorial/part-five/) for a more complete example of using Graph_i_QL
- See the [README for Graph_i_QL](https://github.com/graphql/graphiql)
