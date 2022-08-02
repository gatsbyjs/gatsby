---
date: "2022-08-02"
version: "4.20.0"
title: "v4.20 Release Notes"
---

Welcome to `gatsby@4.20.0` release (August 2022 #1)

Key highlights of this release:

- [RFC for changes in `sort` and aggregation fields in Gatsby GraphQL Schema](#rfc-for-changes-in-sort-and-aggregation-fields-in-gatsby-graphql-schema)
- [Release Candidate for gatsby-plugin-mdx v4](#release-candidate-for-gatsby-plugin-mdx-v4) - Support for MDX v2 and more!

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.19)

[Full changelog][full-changelog]

---

## RFC for changes in `sort` and aggregation fields in Gatsby GraphQL Schema

We are proposing Breaking Changes for next major version of Gatsby to our GraphQL API with goal of increasing performance and redusing resource usage of builds. Proposed changes impact `sort` and aggregation fields (`group`, `min`, `max`, `sum`, `distinct`).

Basic example of proposed change:

Current:

```graphql
{
  allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
    nodes {
      ...fields
    }
  }
}
```

Proposed:

```jsx
{
  allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
    nodes {
      ...fields
    }
  }
}
```

To read more, head over to [RFC: Change to sort and aggregation fields API](https://github.com/gatsbyjs/gatsby/discussions/36242). We appreciate any feedback there.

## Release Candidate for `gatsby-plugin-mdx` v4

In case you missed it: We're working on a new major version of `gatsby-plugin-mdx` to support MDX v2, improve build & frontend performance, and simplify the API.

You can now try out a release candidate version, head to the [MDX v2 RFC](https://github.com/gatsbyjs/gatsby/discussions/25068) to learn more.

## Notable bugfixes & improvements

TODO:

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

TODO: generate this before merging

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.20.0-next.0...gatsby@4.20.0
