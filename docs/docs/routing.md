---
title: Routing
---

Part of what makes Gatsby sites so fast is that a lot of the work is done at build time. During that process, Gatsby creates paths to access content, handling routing for you. Navigating in a Gatsby app requires an understanding of what those paths are and how they’re generated.

This section of guides show you the different ways to create pages in Gatsby, how to handle navigation between and within pages, how to create a shared layout, and how to compose content:

* Gatsby lets you create both unique and templated pages simply by creating React components in a js/.jsx file and placing them in the correct spot within your project. &rarr;
* It also provides an "escape hatch" to create pages that don't fit this model well. &rarr;
* It speeds intra-site performance with a special `Link` helper. &rarr;
* It lets you create layouts to handle elements like headers and footers, and that are shared across pages. &rarr;
* It allows you to use Markdown (.md/.mdx) for a better content composition experience. &rarr;

### Pages defined in `src/pages`

Each `.js` file inside `src/pages` will generate its own page in your Gatsby site. The path for those pages matches the file structure it's found in, allowing nested routes:

| Path                               | Route                              |
| ---------------------------------- | ---------------------------------- |
| `src/pages/contact.js`             | `yoursite.com/contact`             |
| `src/pages/information/contact.js` | `yoursite.com/information/contact` |
| `src/pages/information/index.js`   | `yoursite.com/information`         |

See more at [How to Use src/pages](/docs/src-pages/)

### Using the File System Route API

Other than creating single-page routes in `src/pages` you can also create multiple pages from a model based on the collection of nodes within it. To do that, use curly braces (`{ }`) in the file path to signify dynamic URL segments that relate to a field within the [node](/docs/glossary#node).

Use the File System Route API when you want to create templated pages from your GraphQL data, such as blog posts or products:

| Path                                   |  {Product.name} value |         Route                      |
| -------------------------------------- |  -------------------- | ---------------------------------- |
| `src/pages/products/{Product.name}.js` |  burger               | `yoursite.com/products/burger`     |
|                                        |  pasta                | `yoursite.com/products/pasta`      |
|                                        |  sushi                | `yoursite.com/products/sushi`      |

<!--- This needs to be a new specific "How To" page not the current Reference Doc.-->

See more at [How to Use File System Routing](/docs/file-system-routing/)

### Pages created with `createPage` action

If you need to manually control page creation in a more fine-grained way, Gatsby provides an escape hatch: a `createPage` functon inside the `gatsby-node.js` file that lets you explicitly set the path, the page template, and the data being sent to that template:

```js:title=gatsby-node.js
createPage({
  path: "/routing",
  component: routing,
  context: {},
})
```

<!--- This needs to be a new specific "How To" page not the current Reference Doc.-->

See more at [How to Use createPage in gatsby-node](/docs/using-create-page)

> Warning!
> Since there are multiple ways to create a page, different plugins, themes, or sections of code in your `gatsby-node` file may accidentally create multiple pages that are meant to be accessed by the same path. When this happens, Gatsby will show a warning at build time, but the site will still build successfully. In this situation, the page that was built last will be accessible and any other conflicting pages will not be. Changing any conflicting paths to produce unique URLs should clear up the problem.

## Linking between routes

In order to link between pages, you can use `gatsby-link`. Using `gatsby-link` gives you built in [performance benefits](#performance-and-prefetching).

Alternatively, you can navigate between pages using standard `<a>` tags, but you won't get the benefit of prefetching in this case.

<!--- This needs to be a new specific "How To" page not the current Reference Doc.-->

See more at [How to Use Gatsby Link](/docs/gatsby-link)

## Handling shared page layouts

In order to handle headers, footers, and sidebars that are shared across pages -- or perhaps vary depending on site section, Gatsby has the concept of Layouts.

See more at [How to use layouts](/docs/layout-components/).

## Using markdown to create pages

In addition to using .jsx files to generate pages, you can also use .md files, which allow for a more natural text composition style in local files. Gatsby's ecosystem includes a number of helpers, including auto-linking headers and image processing. 

<!--- This needs to be a new specific "How To" page.-->

See more at [Using Markdown to create pages](/docs/using-markdown-to-create-pages/).

## Embedding components in markdown pages using MDX

MDX allows the easy embedding of JSX components within markdown files.

See more at [Using Markdown to create pages](/docs/using-markdown-to-create-pages/).

## Advanced Guides

### Creating authentication-gated links

For pages dealing with sensitive information, or other dynamic behavior, you may want to handle that information server-side. Gatsby lets you create [client-only routes](/docs/client-only-routes-and-user-authentication) that live behind an authentication gate, ensuring that the information is only available to authorized users.

### Scroll restoration

Gatsby will handle scroll restoration for you in most cases. To track and restore scroll position in additional containers, you can [use the `useScrollRestoration` hook](/docs/scroll-restoration/).
