---
title: TypeScript and Gatsby
---

## Introductory paragraph

[TypeScript](https://www.typescriptlang.org/) is a JavaScript superset which extends the language to include type definitions allowing codebases to be statically checked for soundness. Gatsby provides an integrated experience out of the box, similar to an IDE.

## Example

```tsx:title=src/pages/index.js
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

## Other resources

TypeScript integration is supported through automatically including [`gatsby-plugin-typescript`](/plugins/gatsby-plugin-typescript). Visit that link to see configuration options and limitations of this setup.

If you are new to TypeScript, check out these other resources to learn more:

- [TypeScript Documentation](https://www.typescriptlang.org/docs/handbook/basic-types.html)
- [TypeScript Playground (Try it out!)](https://www.typescriptlang.org/play/index.html)
- [TypeScript Gatsby Example](https://using-typescript.gatsbyjs.org/)
