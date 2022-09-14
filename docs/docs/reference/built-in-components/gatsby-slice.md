---
title: Gatsby Slice API
---

> Support for the Gatsby Slice API was added in `gatsby@5.0.0`.

To further the improvements seen by [Incremental Builds](https://www.gatsbyjs.com/blog/2020-04-22-announcing-incremental-builds/), Gatsby includes a built-in `<Slice>` component to divide pages into incrementally built "slices".

By using a new `<Slice>` React component in combination with the [`createSlice`](/docs/reference/config-files/actions/#createNodeField) API for common UI features, Gatsby will be able to build and deploy individual pieces of your site that had content changes, not just entire pages.

## `<Slice>` enables faster builds in Gatsby Cloud

With the introduction of [Incremental Builds](https://www.gatsbyjs.com/blog/2020-04-22-announcing-incremental-builds/), Gatsby Cloud has been able to reduce build times signficantly by only building the pages that changed. The `<Slice>` component helps reduce those builds times further.

Common components that are shared across the majority of pages on your site might include a navigation bar, footer, or contact form. In today's frameworks, when you re-order the navigation bar items, the entire site needs to be rebuilt. However, if the navigation bar was created as a Gatsby Slice, the new items only need to built once and all pages will pull the new header when it's needed.

## How to use Gatsby's `<Slice>`

For this example, let's use the same scenario as described above - a large site that has a shared navigation bar.

```typescript:title=src/layouts/default-layout.tsx
import { NavigationBar, Footer } from "../components"

export const DefaultLayout = ({ children, navigationBarClassName }: DefaultLayoutProps) => {
  /// ...

  return (
    <div className={styles.defaultLayout} />
      <NavigationBar className={navigationBarClassName} />
      {content}
      <Footer />
    </div>
  )
}
```

### Creating the Slice in `gatsby-node`

Creating a Gatsby Slice is simple using the [`createSlice`](/docs/reference/config-files/actions/#createNodeField) action from the [`createPages`](/docs/reference/config-files/gatsby-node/#createPages) API in your `gatsby-node`.

```typescript:title=gatsby-node.ts
exports.createPages = async ({ actions }) => {
  actions.createSlice({
    id: `navigation-bar`,
    component: require.resolve(`./src/components/navigation-bar.js`),
  })

  // ...
}
```

That's it, now your `navigation-bar` Slice is ready to use!

### Using created Slices

Now we need to convert the `DefaultLayout` component to actually use the new Slice we created.

```diff
-<a href="/blog">Blog</a>
+<Link to="/blog">Blog</Link>

-import { NavigationBar, Footer } from "../components"
+import { Footer } from "../components"
+import { Slices } from "gatsby"

export const DefaultLayout = ({ children, navigationBarClassName }: DefaultLayoutProps) => {
  /// ...

  return (
    <div className={styles.defaultLayout} />
-     <NavigationBar className={navigationBarClassName} />
+     <Slice alias="navigation-bar" className={navigationBarClassName} />
      {content}
      <Footer />
    </div>
  )
}
```

That's it! After a successful `yarn gatsby build`, you should see a list of `Slices` that were built for your site.

### Using Context

Similar to the context that can be passed to pages in [`createPages`](/docs/reference/config-files/gatsby-node/#createPages), [`createSlice`](/docs/reference/config-files/actions/#createNodeField) can also pass context to individual slices.

```typescript:title=gatsby-node.ts
exports.createPages = async ({ actions }) => {
  actions.createSlice({
    id: `navigation-bar`,
    context: {
      theBestPokemon: `Treecko`,
    }
    component: require.resolve(`./src/components/navigation-bar.js`),
  })

  // ...
}
```

The data passed to `context` here will be handed down to the `NavigationBar` component with the key `sliceContext`.

```typescript:title=src/components/navigation-bar.tsx
// highlight-next-line
export const NavigationBar = ({ className, sliceContext }: NavigationBarProps) => {
  // ...

  return (
    <div className={className}>
      <Link to="/">Home</Link>
      // highlight-next-line
      <Link to="/best-pokemon">{sliceContext.bestPokemon}</Link>
    </div>
  )
}
```

### Using Aliases

There will be times where a single Slice will either need to be handed different context or swapped entirely depending on which page it's being rendered on.

This is where we can utilize the `alias` prop that is given to the `<Slice>` component. When we converted the `<NavigationBar>` component to a slice, we created the slice with an `id` of `navigation-bar`, but passed that value to the `alias` prop of `<Slice>`. Why is there a difference in key names?

An `alias` is not a 1-to-1 mapping of string-to-slice. When we create a page using [`createPages`](/docs/reference/config-files/gatsby-node/#createPages), we can actually pass a key-value map of alias-to-id to tell Gatsby which Slice to use throughout the page.

One common use case for this is localization. It's common to iterate over languages to create a page for each one. We can actually create a slice for each language by passing `context`. The `id` that a Slice is created with will be passed to [`createPage`](/docs/reference/config-files/actions/#createPage) to tell each page which slice to use.

In this example, we create a slice of `<NavigationBar>` for each supported language. When we create each page, we'll tell the page which `navigation-bar` to use based on the language of the page we're creating.

```typescript:title=gatsby-node.ts
const SUPPORTED_LANGUAGES = ['en', 'de', 'es']

exports.createPages = async ({ actions }) => {
  // create a slice with a unique ID for each language
  SUPPORTED_LANGUAGES.forEach(language => {
    actions.createSlice({
      // highlight-next-line
      id: `navigation-bar-${language}`,
      context: { language },
      component: require.resolve(`./src/components/navigation-bar.js`),
    })
  })

  // Query for all pages
  const pagesResult = await graphql('...')

  // Create blog pages for each blog post
  pagesResult.data.edges.forEach(({ node }) => {
    SUPPORTED_LANGUAGES.forEach(language => {
      createPage({
        path: node.path,
        component: require.resolve(`./src/templates/blog-post.js`),
        context: {
          pagePath: node.path,
          language,
        },
        slices: {
          // Any time `<Slice alias="navigation-bar">` is seen on this page,
          // use the `navigation-bar-${language}` id
          // highlight-next-line
          'navigation-bar': `navigation-bar-${language}`
        }
      })
    })
  })
}
```
