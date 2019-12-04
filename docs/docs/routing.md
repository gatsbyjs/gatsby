---
title: Routing
---

Part of what makes Gatsby sites so fast is that a lot of the work is done at build time and the running site is using mostly [static content](/docs/adding-app-and-website-functionality/#static-pages). During that process, Gatsby creates paths to access that content, handling [routing](/docs/glossary#routing) for you. Navigating in a Gatsby app requires an understanding of what those paths are and how they're generated.

Alternatively, your application may include functionality that cannot be handled at build time or through [rehydration](/docs/adding-app-and-website-functionality/#how-hydration-makes-apps-possible). This includes things like authentication or retrieving dynamic content. To handle those pages, you can make use of [client-only routes](/docs/client-only-routes-and-user-authentication) using [`@reach/router`](/docs/reach-router-and-gatsby/) which is built into Gatsby.

## Creating routes

Gatsby makes it easy to programmatically control your pages. Pages can be created in three ways:

- In your site's gatsby-node.js by implementing the API
  [`createPages`](/docs/node-apis/#createPages)
- Gatsby core automatically turns React components in `src/pages` into pages
- Plugins can also implement `createPages` and create pages for you

See the [Creating and Modifying Pages](/docs/creating-and-modifying-pages) for more detail.

When Gatsby creates pages it automatically generates a path to access them. This path will differ depending on how the page was defined.

### Pages defined in `src/pages`

Each `.js` file inside `src/pages` will generate its own page in your Gatsby site. The path for those pages matches the file structure it's found in.

For example, `contact.js` will be found at `yoursite.com/contact`. And `home.js` will be found at `yoursite.com/home`. This works at whatever level the file is created. If `contact.js` is moved to a directory called `information`, located inside `src/pages`, the page will now be found at `yoursite.com/information/contact`.

The exception to this rule is any file named `index.js`. Files with this name are matched to the root directory they're found in. That means `index.js` in the root `src/pages` directory is accessed via `yoursite.com`. However, if there is an `index.js` inside the `information` directory, it is found at `yoursite.com/information`.

Note that if no `index.js` file exists in a particular directory that root page does not exist, and attempts to navigate to it will land you on a [404 page](/docs/add-404-page/). For example, `yoursite.com/information/contact` may exist, but that does not guarantee `yoursite.com/information` exists.

### Pages created with `createPage` action

Another way to create pages is in your `gatsby-node.js` file using the `createPage` action, a JavaScript function. When pages are defined this way, the path is explicitly set. For example:

```js:title=gatsby-node.js
createPage({
  path: "/routing",
  component: routing,
  context: {},
})
```

For more information on this action, visit the [`createPage` API documentation](/docs/actions/#createPage).

## Conflicting Routes

Since there are multiple ways to create a page, different plugins, themes, or sections of code in your `gatsby-node` file may accidentally create multiple pages that are meant to be accessed by the same path. When this happens, Gatsby will show a warning at build time, but the site will still build successfully. In this situation, the page that was built last will be accessible and any other conflicting pages will not be. Changing any conflicting paths to produce unique URLs should clear up the problem.

## Nested Routes

If your goal is to define paths that are multiple levels deep, such as `/portfolio/art/item1`, that can be done directly when creating pages as mentioned in [Creating routes](#creating-routes).

Alternatively, if you want to create pages that will display different subcomponents depending on the URL path (such as a specific sidebar widget), Gatsby can handle that at the page level using [layouts](/docs/layout-components/).

## Linking between routes

In order to link between pages, you can use [`gatsby-link`](/docs/gatsby-link/). Using `gatsby-link` gives you built in [performance benefits](#performance-and-prefetching).

Alternatively, you can navigate between pages using standard `<a>` tags, but you won't get the benefit of prefetching in this case.

## Creating authentication-gated links

For pages dealing with sensitive information, or other dynamic behavior, you may want to handle that information server-side. Gatsby lets you create [client-only routes](/docs/client-only-routes-and-user-authentication) that live behind an authentication gate, ensuring that the information is only available to authorized users.

## Performance and Prefetching

In order to improve performance, Gatsby looks for links that appear on the current page to perform prefetching. Before a user has even clicked on a link, Gatsby has started to fetch the page it points to. [Learn more about prefetching](/docs/how-code-splitting-works/#prefetching-chunks).

<GuideList slug={props.slug} />
