---
title: Gatsby Head API
examples:
  - label: Using Gatsby Head
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/using-gatsby-head"
---

> Support for the Gatsby Head API was added in `gatsby@4.19.0`.

Gatsby includes a built-in `Head` export that allows you to add elements to the [document head](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head) of your pages.

Compared to [react-helmet](https://github.com/nfl/react-helmet) or other similar solutions, Gatsby Head is easier to use, more performant, has a smaller bundle size, and is supporting all latest React features.

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

You can also use the arrow function syntax:

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

### Usage notes

You'll need to be aware of these things when using Gatsby Head:

- You can only define the `Head` export inside a page, not in a component.
- The contents of Gatsby Head get cleared upon unmounting the page, so make sure that each page defines what it needs in its `<head>`.
- The `Head` function needs to return valid JSX.
- All elements returned from the `Head` function need to be direct children, so no nesting is allowed.
- Valid tags inside the `Head` function are: `link`, `meta`, `style`, `title`, `base`, and `noscript`.
- If you want to add `<script />` tags to your pages, use the [Gatsby Script Component](/docs/reference/built-in-components/gatsby-script/).

## Properties

The `Head` function receives these properties:

- `location.pathname`: Returns the Location object's URL's path
- `params`: The URL parameters when the page has a `matchPath`
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

## Current limitations

- You can't modify the `<html>` element
- No deduplication happening for same metatags

## Additional Resources

- [Adding an SEO component](/docs/how-to/adding-common-features/adding-seo-component)
- [Using Gatsby Head with TypeScript](/docs/how-to/custom-configuration/typescript/#headprops)
- [Gatsby Script Component](/docs/reference/built-in-components/gatsby-script/)
