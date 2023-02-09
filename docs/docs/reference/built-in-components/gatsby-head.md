---
title: Gatsby Head API
examples:
  - label: Using Gatsby Head
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/using-gatsby-head"
---

> Support for the Gatsby Head API was added in `gatsby@4.19.0`.

Gatsby includes a built-in `Head` export that allows you to add elements to the [document head](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head) of your pages.

Compared to [react-helmet](https://github.com/nfl/react-helmet) or other similar solutions, Gatsby Head is easier to use, more performant, has a smaller bundle size, and supports the latest React features.

## Using Gatsby Head in your page

By exporting a named function called `Head` you can set the metadata for a page:

```jsx:title=src/pages/index.jsx
import * as React from "react"

const Page = () => <div>Hello World</div>
export default Page

export function Head() {
  return (
    <title>Hello World</title>
  )
}
```

The arrow function syntax is also valid:

```jsx
export const Head = () => <title>Hello World</title>
```

When defining multiple metatags use React Fragments:

```jsx
export const Head = () => (
  <>
    <title>Hello World</title>
    <meta name="description" content="Hello World" />
  </>
)
```

You can also re-export a `Head` function in your page from another file:

```jsx:title=src/pages/index.jsx
import * as React from "react"

const Page = () => <div>Hello World</div>
export default Page

// highlight-next-line
export { Head } from "../another/location"
```

### Editing `<html>` and `<body>`

> Support for editing `<html>` and `<body>` was added in `gatsby@5.5.0`.

You can set `<html>` and `<body>` attributes:

```jsx
export function Head() {
  return (
    <>
      <!-- highlight-start -->
      <html lang="en" />
      <body className="my-body-class" />
      <!-- highlight-end -->
      <title>Hello World</title>
    </>
  )
}
```

Gatsby will use provided attributes and inject them into resulting html.

### Deduplication

To avoid duplicate tags in your `<head>` you can use the `id` property on your tags to make sure that only one is rendered. Given the following example:

```jsx
const SEO = ({ children }) => (
  <>
    <title>Hello World</title>
    <link id="icon" rel="icon" href="global-icon" />
    {children}
  </>
)

export const Head = () => (
  <SEO>
    <link id="icon" rel="icon" href="icon-specific-for-this-page" />
  </SEO>
)
```

In this case only the second `<link id="icon" rel="icon" href="icon-specific-for-this-page" />` is rendered. In a list of items with the same `id`, the last item wins and is used in the HTML.

### Usage notes

You'll need to be aware of these things when using Gatsby Head:

- You can only define the `Head` export inside a page (that includes templates for [`createPage`](/docs/reference/config-files/actions/#createPage)), not in a component.
- The contents of Gatsby Head get cleared upon unmounting the page, so make sure that each page defines what it needs in its `<head>`.
- The `Head` function needs to return valid JSX.
- Valid tags inside the `Head` function are: `link`, `meta`, `style`, `title`, `base`, `script`, and `noscript`.
- `html` and `body` tags defined in `Head` overwrite the attributes defined in [`onRenderBody`](/docs/reference/config-files/gatsby-ssr/#onRenderBody) (`setHtmlAttributes` and `setBodyAttributes`).
- Data block `<script>` tags such as `<script type="application/ld+json">` can go in the `Head` function, but dynamic scripts are better loaded with the [Gatsby Script Component](/docs/reference/built-in-components/gatsby-script/) in your pages or components.
- As of `gatsby@5.6.0`, `Head` can access [React Context](https://reactjs.org/docs/context.html) that you defined in the [`wrapRootElement` API](/docs/reference/config-files/gatsby-browser/#wrapRootElement). It's important to note that `wrapRootElement` should only be used to set up context providers. UI components should be defined in [`wrapPageElement` API](/docs/reference/config-files/gatsby-browser/#wrapPageElement).

## Properties

The `Head` function receives these properties:

- `location.pathname`: Returns the Location object's URL's path
- `params`: The URL parameters when the page has a `matchPath` (when using [client-only routes](/docs/how-to/routing/client-only-routes-and-user-authentication/))
- `data`: Data passed into the page via an exported GraphQL query
- `pageContext`: A context object which is passed in during the creation of the page

```jsx
export const Head = ({ location, params, data, pageContext }) => (
  <>
    <title>{pageContext.title}</title>
    <meta name="description" content={data.page.description} />
    <meta
      name="twitter:url"
      content={`https://www.foobar.tld/${location.pathname}`}
    />
  </>
)
```

## Additional Resources

- [Adding an SEO component](/docs/how-to/adding-common-features/adding-seo-component)
- [Using Gatsby Head with TypeScript](/docs/how-to/custom-configuration/typescript/#gatsby-head-api)
- [Gatsby Script Component](/docs/reference/built-in-components/gatsby-script/)
