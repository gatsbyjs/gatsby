---
title: JAMStack
disableTableOfContents: true
---

Learn how to use Gatsby to build websites powered by the JAMStack, a modern architecture that uses JavaScript, APIs and markup instead of a databases and server-side programming languages.

## What is the JAMStack?

JAMStack is a modern architecture for building websites and applications. The _<abbr>JAM</abbr>_ in JAMStack stands for [JavaScript](/docs/glossary#javascript), [APIs](/docs/glossary#api), and HTML markup.

With more traditional websites, such as those built with WordPress or Drupal, content is stored in a database. There's also a presentation layer made of template files, which are sometimes called _views_.

Template files use a mix of [HTML](/docs/glossary#html), CSS, JavaScript, and template tags. Think of template tags as placeholders for pieces of content, e.g. `{{ title }}` for the title of the page.

A software layer then pulls it all together. This layer retrieves content from the database, replaces tags in the template files with the appropriate chunks of content, and returns it all to the browser. A single page gets regenerated each time the server receives a request for that URL.

In this type of architecture, the [frontend](/docs/glossary#frontend) (what you see in the browser) and [backend](/docs/glossary#backend) (the database and software layer) are _tightly coupled_. Both the content and how it's presented are part of the same code base. Content is only available as HTML and only clients that are capable of parsing HTML (browsers, for example) can use it.

### The advantages of JAMStack

In a JAMStack architecture, the frontend and backend are [decoupled](https://www.gatsbyjs.org/docs/glossary#decoupled). Instead of using a database server and software layer to generate markup, your site's content and its presentation are separate concerns.

A JAMStack backend consists of a content API that returns JSON or XML. Your API can be a [hosted datastore](https://www.gatsbyjs.org/docs/sourcing-from-hosted-services/), a [headless CMS](https://www.gatsbyjs.org/docs/headless-cms/), or a custom application. The same API can serve your Gatsby site as well as your mobile and desktop applications.

A JAMStack frontend consists of JavaScript, HTML, and CSS. Gatsby generates these files during the [build](/docs/glossary#build) process. Because they are static files, they can be hosted anywhere. You can use web server-based hosting, or use an object storage service and content delivery network such as [Netlify](https://www.gatsbyjs.org/docs/deploying-to-netlify), [Render](https://www.gatsbyjs.org/docs/deploying-to-render), or Amazon Web Services' [S3 and Cloudfront](https://www.gatsbyjs.org/docs/deploying-to-s3-cloudfront).

### Learn more about JAMStack architecture

- [JAMStack.org](https://jamstack.org/) website
- [JAMstack WTF](https://jamstack.wtf/), built with Gatsby
- [Deploying and Hosting](https://www.gatsbyjs.org/docs/deploying-and-hosting/) from the Gatsby Docs
