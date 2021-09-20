---
title: Static Site Generator
disableTableOfContents: true
---

Learn what a static site generator is and why you might choose a static site generator, such as Gatsby, over other publishing tools.

## What is a Static Site Generator?

A static site generator is a software application that creates HTML pages from templates or components and a given content source. Most static site generators, [including Gatsby](/docs/how-to/routing/adding-markdown-pages/), accept [Markdown](https://daringfireball.net/projects/markdown/)-formatted text files as a source, although Gatsby is not limited to Markdown.

Static site generators are an alternative to database-driven content management systems, such as WordPress and Drupal. In such systems, content is managed and stored in a database. When the server receives a request for a particular URL, a software layer retrieves data from the database, merges it with template files, and generates an HTML page as its response.

Static site generators, on the other hand, generate HTML pages during a [build](/docs/glossary/#build) process. Gatsby, for example, loads JSON from [GraphQL](/docs/glossary/graphql), and merges that data with components to create HTML pages. These generated pages are then deployed to a web server. When the server receives a request, it responds with rendered HTML. Static pages eliminate the latency that databases introduce.

> Note: It's also possible to use Gatsby [without GraphQL](/docs/how-to/querying-data/using-gatsby-without-graphql/), using the `createPages` API.

You can also use static site generators to create [JAMStack](/docs/glossary/#jamstack) sites. JAMStack is a modern website architecture that uses JavaScript, content APIs, and markup. Gatsby, for example, can use the [WordPress REST API](/docs/how-to/sourcing-data/sourcing-from-wordpress/) as a data source.

### Advantages of static site generators

Static site generators **reduce site complexity**. That, in turn, improves speed and reliability, and smooths the developer experience.

- You don't have to worry about database-toppling traffic spikes.
- There's no need to manage database server software or backups.
- You can use version control software to manage and track changes to your content.
- Because your site is static, you can even forgo web servers and load balancers altogether. Instead, you can host your site with a content delivery network that scales with your site's traffic.

There are dozens of static site generators available, created with a range of programming languages. Gatsby is [JavaScript](/docs/glossary/#javascript) at its core, and is built with [React](/docs/glossary/#react), GraphQL, and [Node.js](/docs/glossary/#nodejs). See how Gatsby [compares to WordPress and Drupal](/features/cms/gatsby-vs-wordpress-vs-drupal) or to popular [static site generators](/features/jamstack/).

### Learn more

- [JAMStack](/docs/glossary/#jamstack) architecture from the Gatsby docs
- [Sourcing Content and Data](/docs/content-and-data/) for Gatsby
- [Adding Markdown Pages](/docs/how-to/routing/adding-markdown-pages/) from the Gatsby docs
