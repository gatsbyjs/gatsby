---
title: TypeScript and Gatsby
examples:
  - label: Using Typescript
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/using-typescript"
---

## Introduction

[TypeScript](https://www.typescriptlang.org/) is a JavaScript superset which extends the language to include type definitions allowing codebases to be statically checked for soundness. Gatsby provides an integrated experience out of the box, similar to an IDE. If you are new to TypeScript, adoption can _and should_ be incremental. Since Gatsby natively supports JavaScript and TypeScript, you can change files from `.js`/`.jsx` to `.ts`/`.tsx` at any point to start adding types and gaining the benefits of a type system.

To see all of the types available and their generics look at our [TypeScript definition file](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/index.d.ts).

## Initializing a new Gatsby project with TypeScript

Getting started with a TypeScript Gatsby project is easy with the `create-gatsby` CLI

```
npm init gatsby
```

In the prompts, select TypeScript as your preferred language. Instead of manually selecting TypeScript as your preffered language in the prompts, You can also pass a `ts` flag to the above command like so:

```
npm init gatsby -ts
```

## Type hinting in JS files

You can still take advantage of type hinting in Javascript files with [JSdoc](https://jsdoc.app/) by importing types from directly from Gatsby. You need to be on a text exitor that supports [JSdoc](https://jsdoc.app/) for this to work.

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
 * @type {import('gatsby').GatsbyConfig['createPages']}
 */
exports.createPages = () => {}
```

## The `tsconfig.json` file

Gatsby doesn't use the `tsconfig.json` file in your project root as options to the TypeScript compiler when compiling your TypeScript files. Essentially, the `tsconfig.json` file is used in tools external to Gatsby e.g Testing Frameworks like Jest, Code editors and Linting libraries like EsLint to enable them handle TypeScript correctly.

## Usage in Gatsby

### `PageProps`

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

### `gatsby-browser.tsx` / `gatsby-ssr.tsx`

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

### `getServerData`

You can use `GetServerData`, `GetServerDataProps`, and `GetServerDataReturn` for [`getServerData`](/docs/reference/rendering-options/server-side-rendering/).

```tsx:title=src/pages/ssr.tsx
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

### `gatsby-config.ts`

```ts:title=gatsby-config.ts
import { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  siteMetadata: {
    title: "Site Title",
    siteUrl: "Site URL",
  },
  plugins: [],
};

export default config
```

### `gatsby-node.ts`

```ts:title=gatsby-node.ts
import { GatsbyNode } from "gatsby";

type Person = {
  id: number
  name: string
  age: number
}

export const sourceNodes: GatsbyNode["sourceNodes"] = async ({
  actions,
  createNodeId,
}) => {
  const { createNode } = actions

  const data = await getSomeData();

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
    };

    createNode(node)
  });
};
```

## Styling

[vanilla-extract](https://vanilla-extract.style/) helps you write type‑safe, locally scoped classes, variables and themes. It's a great solution when it comes to styling in your TypeScript project. To use [`vanilla-extract`](https://vanilla-extract.style/), select "vanilla-extract" as your preffered styling solution when initializing your project with with `npm init gatsby` You can also manually setup your project to use vanilla extract through [gatsby-plugin-vanilla-extract](/plugins/gatsby-plugin-vanilla-extract/). See [setup instructions](/plugins/gatsby-plugin-vanilla-extract/)

## Migrating to TS

Gatsby natively supports JavaScript and TypeScript, you can change files from `.js` to `.tsx`/ `ts` at any point to start adding types and gaining the benefits of a type system. But you'll need to do a bit more to be able use write use Typescipt in `gatsby-*` files

- Rename files in `/src` that use JSX from `.js` to `.tsx`
- Install `@types/node`, `@types/react`, `@types/react-dom`, `typescript` as devDependencies
- Add a `tsconfig.json` file using `npx tsc init`. see details about `tsconfig` file [in this section](/#the-tsconfigjson-file)
- Rename `gatsby-*` files:
  `gatsby-node.js` -> `gatsby-node.ts`
  `gatsby-config.js` -> `gatsby-node.js`
  `gatsby-browser.js` -> `gatsby-browser.tsx`
  `gatsby-ssr.js` -> `gatsby-ssr.tsx`

**Note**: You have be on `gatsby@4.8.0` or higher to use TypeScript in `gatsby-*` files

## Other resources

TypeScript integration is supported through automatically including [`gatsby-plugin-typescript`](/plugins/gatsby-plugin-typescript/). Visit that link to see configuration options and limitations of this setup.

If you are new to TypeScript, check out these other resources to learn more:

- [TypeScript Documentation](https://www.typescriptlang.org/docs/handbook/basic-types.html)
- [TypeScript Playground (Try it out!)](https://www.typescriptlang.org/play/index.html)
- [TypeScript Gatsby Example](https://using-typescript.gatsbyjs.org/)
