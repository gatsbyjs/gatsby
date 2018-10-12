---
title: Using Unstructured Data
---

This is a stub. Help our community expand it.

Please use the [Gatsby Style Guide](/docs/gatsby-style-guide/) to ensure your
pull request gets accepted.

Initial notes:
[GitHub Issue #8482](https://github.com/gatsbyjs/gatsby/issues/8482)

### Do I have to use GraphQL and source plugins to pull data into Gatsby sites?

Absolutely not! You can use the node `createPages` API to pull unstructured data into Gatsby sites rather than GraphQL and source plugins. This is a great choice for small sites, while GraphQL and source plugins can help save time with more complex sites.

### Prerequisites (if any)

### The facts

### Example

**to do** Possibly pull from these examples
https://twitter.com/thekitze/status/1043532445742784515
https://jsonplaceholder.typicode.com/

### Tradeoffs to this approach

While using the node `createPages` API can be the most straightforward way to build a smaller site, there are tradeoffs to this approach.

The first tradeoff is that you cannot transform your data with transformer plugins like `gatsby-image`, which provides image optimization out of the box.

The second tradeoff is that pulling data in medium+ complex sites could become more difficult.

### The Gatsby recommendation

If you're building a small site, one efficient way to build it is to pull in unstructured data as outlined in this guide, using `createPages` API, and then if the site becomes more complex later on, you move on to building more complex sites, or you'd like to transform your data, follow these steps:

1.  Check out the [Plugin Library](/packages/) to see if the source plugins and/or transformer plugins you'd like to use already exist
2.  If they don't exist, read the [Plugin Authoring](/docs/plugin-authoring/) guide and consider building your own!

### Other resources

- Link to a blogpost
- Link to a YouTube tutorial
- Link to an example site
- Link to source code for a live site
- Links to relevant plugins
- Links to starters
