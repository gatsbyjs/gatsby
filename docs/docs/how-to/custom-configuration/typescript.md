---
title: TypeScript and Gatsby
examples:
  - label: Using Typescript
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/using-typescript"
---

## Introductory paragraph

[TypeScript](https://www.typescriptlang.org/) is a JavaScript superset which extends the language to include type definitions allowing codebases to be statically checked for soundness. Gatsby provides an integrated experience out of the box, similar to an IDE. If you are new to TypeScript, adoption can _and should_ be incremental. Since Gatsby natively supports JavaScript and TypeScript, you can change files from `.js` to `.tsx` at any point to start adding types and gaining the benefits of a type system.

## Example

```tsx:title=src/pages/index.tsx
import React from "react"
import { PageProps } from "gatsby"

export default function IndexRoute(props: PageProps) {
  return (
    <>
      <h1>Path:</h1>
      <p>{props.path}</p>
    </>
  )
}
```

The example above uses the power of TypeScript, in combination with exported types from Gatsby (`PageProps`) to tell this code what props is. This can greatly improve your developer experience by letting your IDE show you what properties are injected by Gatsby. To see all of the types available look at our [TypeScript definition file](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/index.d.ts).

## Other resources

TypeScript integration is supported through automatically including [`gatsby-plugin-typescript`](/plugins/gatsby-plugin-typescript/). Visit that link to see configuration options and limitations of this setup.

If you are new to TypeScript, check out these other resources to learn more:

- [TypeScript Documentation](https://www.typescriptlang.org/docs/handbook/basic-types.html)
- [TypeScript Playground (Try it out!)](https://www.typescriptlang.org/play/index.html)
- [TypeScript Gatsby Example](https://using-typescript.gatsbyjs.org/)
