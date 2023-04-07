---
title: TypeScript and Gatsby
examples:
  - label: Using TypeScript
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/using-typescript"
  - label: Using vanilla-extract
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/using-vanilla-extract"
---

## Introduction

[TypeScript](https://www.typescriptlang.org/) is a JavaScript superset which extends the language to include type definitions allowing codebases to be statically checked for soundness. Gatsby provides an integrated experience out of the box, similar to an IDE. If you are new to TypeScript, adoption can _and should_ be incremental. Since Gatsby natively supports JavaScript and TypeScript, you can change files from `.js`/`.jsx` to `.ts`/`.tsx` at any point to start adding types and gaining the benefits of a type system.

To see all of the types available and their generics look at our [TypeScript definition file](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/index.d.ts).

## Initializing a new project with TypeScript

You can get started with TypeScript and Gatsby by using the CLI:

```
npm init gatsby
```

In the prompts, select TypeScript as your preferred language. You can also pass a `ts` flag to the above command to skip that question and use TypeScript:

```
npm init gatsby -ts
```

## Usage in Gatsby

### `PageProps`

```tsx:title=src/pages/index.tsx
import * as React from "react"
import type { PageProps } from "gatsby"

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

`PageProps` can receive a couple of [generics](https://www.typescriptlang.org/docs/handbook/2/generics.html), most notably the `DataType` one. This way you can type the resulting `data` prop. Others are: `PageContextType`, `LocationState`, and `ServerDataType`.

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

If you don't want to manually type out `DataProps` you can use Gatsby's [GraphQL Typegen](/docs/how-to/local-development/graphql-typegen) feature.

### `gatsby-browser.tsx` / `gatsby-ssr.tsx`

> Support added in `gatsby@4.8.0`

You can also write `gatsby-browser` and `gatsby-ssr` in TypeScript. You have the types `GatsbyBrowser` and `GatsbySSR` available to type your API functions. Here are two examples:

```tsx:title=gatsby-browser.tsx
import * as React from "react"
import type { GatsbyBrowser } from "gatsby"

export const wrapPageElement: GatsbyBrowser["wrapPageElement"] = ({
  element,
}) => {
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
import type { GatsbySSR } from "gatsby"

export const wrapPageElement: GatsbySSR["wrapPageElement"] = ({ element }) => {
  return (
    <div>
      <h1>Hello World</h1>
      {element}
    </div>
  )
}
```

### `getServerData`

You can use `GetServerData`, `GetServerDataProps`, and `GetServerDataReturn` for [`getServerData`](/docs/reference/rendering-options/server-side-rendering/).

```tsx:title=src/pages/ssr.tsx
import * as React from "react"
import type { GetServerDataProps, GetServerDataReturn } from "gatsby"

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
export const getServerData: GetServerData<ServerDataProps> = async props => {
  // your function body
}
```

### `gatsby-config.ts`

> Support added in `gatsby@4.9.0`

You can import the type `GatsbyConfig` to type your config object. **Please note:** There are currently no type hints for `plugins` and you'll need to check the [current limitations](#current-limitations) and see if they apply to your `gatsby-config.ts` file.

```ts:title=gatsby-config.ts
import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    title: "Your Title",
  },
  plugins: [],
}

export default config
```

Read the [Gatsby Config API documentation](/docs/reference/config-files/gatsby-config/) to learn more about its different options.

### `gatsby-node.ts`

> Support added in `gatsby@4.9.0`

You can import the type `GatsbyNode` to type your APIs by accessing keys on `GatsbyNode`, e.g. `GatsbyNode["sourceNodes"]`. **Please note:** You'll need to check the [current limitations](#current-limitations) and see if they apply to your `gatsby-node.ts` file.

```ts:title=gatsby-node.ts
import type { GatsbyNode } from "gatsby"

type Person = {
  id: number
  name: string
  age: number
}

export const sourceNodes: GatsbyNode["sourceNodes"] = async ({
  actions,
  createNodeId,
  createContentDigest,
}) => {
  const { createNode } = actions

  const data = await getSomeData()

  data.forEach((person: Person) => {
    const node = {
      ...person,
      parent: null,
      children: [],
      id: createNodeId(`person__${person.id}`),
      internal: {
        type: "Person",
        content: JSON.stringify(person),
        contentDigest: createContentDigest(person),
      },
    }

    createNode(node)
  })
}
```

Read the [Gatsby Node APIs documentation](/docs/reference/config-files/gatsby-node/) to learn more about its different APIs.

### Gatsby Head API

You can use `HeadProps` to type your [Gatsby Head API](/docs/reference/built-in-components/gatsby-head/).

```tsx:title=src/pages/index.tsx
import * as React from "react"
import type { HeadProps } from "gatsby"

const Page = () => <div>Hello World</div>
export default Page

export function Head(props: HeadProps) {
  return (
    <title>Hello World</title>
  )
}
```

Similar to [`PageProps`](#pageprops) the `HeadProps` can receive two [generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) (`DataType` and `PageContextType`). This way you can type the `data` prop that gets passed to the `Head` function.

```tsx:title=src/pages/index.tsx
import * as React from "react"
import { graphql, HeadProps, PageProps } from "gatsby"

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

export function Head(props: HeadProps<DataProps>) {
  return (
    <title>{props.data.site.siteMetadata.title}</title>
  )
}

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

If you’re using an anonymous function, you can also use the shorthand `HeadFC` type like this:

```tsx
export const Head: HeadFC<DataProps> = props => {
  // your return value
}
```

### Gatsby Slice API

> Support added in `gatsby@5.0.0`

You can use `SliceComponentProps` to type your Slice component from the [Gatsby Slice API](/docs/reference/built-in-components/gatsby-slice/). `SliceComponentProps` can receive three [generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) (`DataType`, `SliceContextType`, and `AdditionalSerializableProps`). This way you can type the `data` and `pageContext` prop that gets passed to your Slice component.

```tsx
import * as React from "react"
import { SliceComponentProps, graphql } from "gatsby"

type DataType = {
  site: {
    siteMetadata: {
      title: string
    }
  }
}

type SliceContextType = {
  locale: string
}

type AdditionalSerializableProps = {
  theme: "light" | "dark"
}

const Navigation = ({
  data,
  sliceContext,
  theme,
}: SliceComponentProps<
  DataType,
  SliceContextType,
  AdditionalSerializableProps
>) => (
  <nav className={`theme---${theme}`}>
    Menu for {sliceContext.locale} at {data.site.siteMetadata.title}
  </nav>
)

export default Navigation

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

### Local Plugins

> Support added in `gatsby@4.9.0`

All the files mentioned above can also be written and used inside a [local plugin](/docs/creating-a-local-plugin/).

## `tsconfig.json`

Essentially, the `tsconfig.json` file is used in tools external to Gatsby e.g Testing Frameworks like Jest, Code editors and Linting libraries like EsLint to enable them handle TypeScript correctly. You can use the `tsconfig.json` from our [gatsby-minimal-starter-ts](https://github.com/gatsbyjs/gatsby/blob/master/starters/gatsby-starter-minimal-ts/tsconfig.json).

## Type Hinting in JS Files

You can still take advantage of type hinting in JavaScript files with [JSdoc](https://jsdoc.app/) by importing types directly from Gatsby. You need to use a text exitor that supports those type hints.

### Usage in `gatsby-config.js`

```js:title=gatsby-config.js
// @ts-check

/**
 * @type {import('gatsby').GatsbyConfig}
 */
const gatsbyConfig = {}

module.exports = gatsbyConfig
```

### Usage in `gatsby-node.js`

```js:title=gatsby-node.js
// @ts-check

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = () => {}
```

## Styling

### vanilla-extract

[vanilla-extract](https://vanilla-extract.style/) helps you write type‑safe, locally scoped classes, variables and themes. It's a great solution when it comes to styling in your TypeScript project. To use vanilla-extract, select it as your preferred styling solution when initializing your project with `npm init gatsby`. You can also manually setup your project through [gatsby-plugin-vanilla-extract](/plugins/gatsby-plugin-vanilla-extract/) or use the [vanilla-extract example](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-vanilla-extract).

### CSS Modules

To import CSS Modules add this typing definition to your source folder:

```typescript:title=src/module.css.d.ts
declare module "*.module.css";
```

## Migrating to TypeScript

Gatsby natively supports JavaScript and TypeScript, you can change files from `.js`/`.jsx` to `.ts`/ `tsx` at any point to start adding types and gaining the benefits of a type system. But you'll need to do a bit more to be able use Typescipt in `gatsby-*` files:

- Run `gatsby clean` to remove any old artifacts
- Convert your `.js`/`.jsx` files to `.ts/.tsx`
- Install `@types/node`, `@types/react`, `@types/react-dom`, and `typescript` as `devDependencies`
- Add a `tsconfig.json` file using `npx tsc --init` or use the one from [gatsby-minimal-starter-ts](https://github.com/gatsbyjs/gatsby/blob/master/starters/gatsby-starter-minimal-ts/tsconfig.json)
- Rename `gatsby-*` files:
  - `gatsby-node.js` to `gatsby-node.ts`
  - `gatsby-config.js` to `gatsby-config.ts`
  - `gatsby-browser.js` to `gatsby-browser.tsx`
  - `gatsby-ssr.js` to `gatsby-ssr.tsx`
- Address any of the [current limitations](#current-limitations)

If you've used other ways of using TypeScript in the past, you'll also want to read [migrating away from old workarounds](/docs/reference/release-notes/v4.9/#migrating-away-from-old-workarounds).

## Current limitations

There are some limitations currently that you need to be aware of. We'll do our best to mitigate them in our code, through contributions to upstream dependencies, and updates to our documentation.

### Parcel TypeScript features

Parcel is used for the compilation and it currently has [limitations on TypeScript features](https://parceljs.org/languages/typescript/), namely:

- No support for `baseUrl` or `paths` inside `tsconfig.json`
- It implicitly enables the [`isolatedModules`](https://www.typescriptlang.org/tsconfig#isolatedModules) option by default

### `require.resolve`

You can't use `require.resolve` in your files. You'll need to replace these instances with a `path.resolve` call. Example diff for a `gatsby-node` file:

```diff
+ import path from "path"

+ const template = path.resolve(`./src/templates/template.tsx`)
- const template = require.resolve(`./src/templates/template.tsx`)
```

Progress on this is tracked in [Parcel #6925](https://github.com/parcel-bundler/parcel/issues/6925).

### Other

- Workspaces (e.g. Yarn) are not supported.
- When changing `siteMetadata` in `gatsby-config` no hot-reloading will occur during `gatsby develop`. A restart is needed at the moment.

## Other Resources

TypeScript integration for pages is supported through automatically including [`gatsby-plugin-typescript`](/plugins/gatsby-plugin-typescript/). Visit that link to see configuration options and limitations of this setup.

You can also use Gatsby's [GraphQL Typegen](/docs/how-to/local-development/graphql-typegen) feature to have type-safety for your GraphQL results and autocompletion in your favorite IDE.

If you are new to TypeScript, check out these other resources to learn more:

- [TypeScript Documentation](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript Playground (Try it out!)](https://www.typescriptlang.org/play)
