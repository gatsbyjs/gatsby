---
title: TypeScript and Gatsby
examples:
  - label: Using Typescript
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/using-typescript"
---

## Introduction

[TypeScript](https://www.typescriptlang.org/) is a JavaScript superset which extends the language to include type definitions allowing codebases to be statically checked for soundness. Gatsby provides an integrated experience out of the box, similar to an IDE. If you are new to TypeScript, adoption can _and should_ be incremental. Since Gatsby natively supports JavaScript and TypeScript, you can change files from `.js`/`.jsx` to `.ts`/`.tsx` at any point to start adding types and gaining the benefits of a type system.

To see all of the types available and their generics look at our [TypeScript definition file](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/index.d.ts).

## `PageProps`

```tsx:title=src/pages/index.tsx
import * as React from "react"
import { PageProps } from "gatsby"

const IndexRoute = ({ path }: PageProps) => {
  return (
    <main>
      <h1>Path: {path}</h1>
    </main>
  )
}

export default IndexRoute
```

The example above uses the power of TypeScript, in combination with exported types from Gatsby (`PageProps`) to tell this code what props is. This can greatly improve your developer experience by letting your IDE show you what properties are injected by Gatsby.

`PageProps` can receive a couple of [generics](https://www.typescriptlang.org/docs/handbook/2/generics.html), most notably the `DataType` one. This way you can type the resulting `data` prop.

```tsx:title=src/pages/index.tsx
import * as React from "react"
import { graphql, PageProps } from "gatsby"

type DataProps = {
  site: {
    siteMetadata: {
      title: string
    }
  }
}

const IndexRoute = ({ data: { site } }: PageProps<DataProps>) => {
  return (
    <main>
      <h1>{site.siteMetadata.title}</h1>
    </main>
  )
}

export default IndexRoute

export const query = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
  }
`
```

## `gatsby-browser.tsx` / `gatsby-ssr.tsx`

You can also write `gatsby-browser` and `gatsby-ssr` in TypeScript. You have the types `GatsbyBrowser` and `GatsbySSR` available to type your API functions. Here are two examples:

```tsx:title=gatsby-browser.tsx
import * as React from "react"
import { GatsbyBrowser } from "gatsby"

export const wrapPageElement: GatsbyBrowser["wrapPageElement"] = ({ element }) => {
  return (
    <div>
      <h1>Hello World</h1>
      {element}
    </div>
  )
}
```

```tsx:title=gatsby-ssr.tsx
import * as React from "react"
import { GatsbySSR } from "gatsby"

export const wrapPageElement: GatsbySSR["wrapPageElement"] = ({ element }) => {
  return (
    <div>
      <h1>Hello World</h1>
      {element}
    </div>
  )
}
```

## `getServerData`

You can use `GetServerData`, `GetServerDataProps`, and `GetServerDataReturn` for [`getServerData`](/docs/reference/rendering-options/server-side-rendering/).

```tsx:src/pages/ssr.tsx
import * as React from "react"
import { GetServerDataProps, GetServerDataReturn } from "gatsby"

type ServerDataProps = {
  hello: string
}

const Page = () => <div>Hello World</div>
export default Page

export async function getServerData(
  props: GetServerDataProps
): GetServerDataReturn<ServerDataProps> {
  return {
    status: 200,
    headers: {},
    props: {
      hello: "world",
    },
  }
}
```

If you’re using an anonymous function, you can also use the shorthand `GetServerData` type like this:

```tsx
const getServerData: GetServerData<ServerDataProps> = async props => {
  // your function body
}
```

## Other resources

TypeScript integration is supported through automatically including [`gatsby-plugin-typescript`](/plugins/gatsby-plugin-typescript/). Visit that link to see configuration options and limitations of this setup.

If you are new to TypeScript, check out these other resources to learn more:

- [TypeScript Documentation](https://www.typescriptlang.org/docs/handbook/basic-types.html)
- [TypeScript Playground (Try it out!)](https://www.typescriptlang.org/play/index.html)
- [TypeScript Gatsby Example](https://using-typescript.gatsbyjs.org/)
