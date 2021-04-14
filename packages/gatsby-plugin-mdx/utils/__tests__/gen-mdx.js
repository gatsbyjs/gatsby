const path = require(`path`)
const { findImports } = require(`../gen-mdx`)

const markdownContent = `---
title: Introduction
---

# Header 1
## Header 2
### Header 3

\`\`\`js
console.log('hello world')
\`\`\`
`

describe(`find imports`, () => {
  it(`allows injecting imports via plugins`, async () => {
    const results = await findImports({
      node: {
        id: `bbffffbb-bfff-bfff-bfff-dededededede`,
        children: [],
        parent: `bbffffbb-bfff-bfff-bfff-dededededebb`,
        internal: {
          content: markdownContent,
          type: `Mdx`,
          contentDigest: `6433c536b5eb922ad01f8d420bcabf6d`,
          counter: 38,
          owner: `gatsby-plugin-mdx`,
        },
        frontmatter: { title: `Introduction` },
        excerpt: undefined,
        exports: {},
        rawBody: markdownContent,
        fileAbsolutePath: `/path/to/getting-started.mdx`,
      },
      options: {
        remarkPlugins: [],
        gatsbyRemarkPlugins: [
          { resolve: path.join(__dirname, `fixtures`, `test-plugin`) },
        ],
      },
      getNode: () => null,
      getNodes: () => [],
      getNodesByType: () => [],
      repoter: () => {},
      cache: () => {},
      pathPrefix: ``,
    })

    expect(results).toEqual({
      scopeImports: [
        `import * as testInjection from '@private/test-inject'`,
        `import * as React from 'react'`,
      ],
      scopeIdentifiers: [`testInjection`, `React`],
    })
  })
})
