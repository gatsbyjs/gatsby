import { transform as babelTransform } from "@babel/core"
import plugin from "../"

function matchesSnapshot(query): void {
  // @ts-ignore - code exists
  const { code: codeWithoutFileName } = babelTransform(query, {
    presets: [`@babel/preset-react`],
    plugins: [plugin],
  })
  // @ts-ignore - code exists
  const { code: codeWithFileName } = babelTransform(query, {
    presets: [`@babel/preset-react`],
    plugins: [plugin],
    filename: `src/components/test.js`,
  })

  expect(codeWithoutFileName).toMatchSnapshot()
  expect(codeWithFileName).toMatchSnapshot()
}

function transform(query): string | null | undefined {
  // @ts-ignore - code exists
  const { code } = babelTransform(query, {
    presets: [`@babel/preset-react`],
    plugins: [plugin],
  })
  return code
}

describe(`babel-plugin-remove-graphql-queries`, () => {
  it.todo(
    `Works correctly with the kitchen sink`
    // , () => {
    //   matchesSnapshot(`
    //   import * as React from 'react'
    //   import { graphql, useStaticQuery, StaticQuery } from 'gatsby'

    //   export default () => {
    //     const query = graphql\`{site { siteMetadata { title }}}\`
    //     const siteDescription = useStaticQuery(query)

    //     return (
    //       <StaticQuery
    //         query={graphql\`{site { siteMetadata { title }}}\`}
    //         render={data => (
    //           <div>
    //             <h1>{data.site.siteMetadata.title}</h1>
    //             <p>{siteDescription.site.siteMetadata.description}</p>
    //           </div>
    //         )}
    //       />
    //     )
    //   }
    //   `)
    // }
  )

  it(`Transforms queries in useStaticQuery`, () => {
    matchesSnapshot(`
  import * as React from 'react'
  import { graphql, useStaticQuery } from 'gatsby'

  export default () => {
    const siteTitle = useStaticQuery(graphql\`{site { siteMetadata { title }}}\`)

    return (
      <h1>{siteTitle.site.siteMetadata.title}</h1>
    )
  }
  `)
  })

  it(`Transforms queries in useStaticQuery that use commonjs`, () => {
    matchesSnapshot(`
  const React = require("react")
  const { graphql, useStaticQuery } = require("gatsby")

  module.exports = () => {
    const siteTitle = useStaticQuery(graphql\`{site { siteMetadata { title }}}\`)

    return (
      <h1>{siteTitle.site.siteMetadata.title}</h1>
    )
  }
  `)
  })

  it(`Transforms exported queries in useStaticQuery`, () => {
    matchesSnapshot(`
  import * as React from 'react'
  import { graphql, useStaticQuery } from 'gatsby'

  export default () => {
    const data = useStaticQuery(query)

    return (
      <>
        <h1>{data.site.siteMetadata.title}</h1>
        <p>{data.site.siteMetadata.description}</p>
      </>
    )
  }

  export const query = graphql\`{site { siteMetadata { title }}}\`
  `)
  })

  it(`Transforms queries defined in own variable in useStaticQuery`, () => {
    matchesSnapshot(`
  import * as React from 'react'
  import { graphql, useStaticQuery } from 'gatsby'

  export default () => {
    const query = graphql\`{site { siteMetadata { title }}}\`
    const siteTitle = useStaticQuery(query)

    return (
      <h1>{siteTitle.site.siteMetadata.title}</h1>
    )
  }
  `)
  })

  it(`Transforms queries and preserves destructuring in useStaticQuery`, () => {
    matchesSnapshot(`
  import * as React from 'react'
  import { graphql, useStaticQuery } from 'gatsby'

  export default () => {
    const query = graphql\`{site { siteMetadata { title }}}\`
    const { site } = useStaticQuery(query)

    return (
      <h1>{site.siteMetadata.title}</h1>
    )
  }
  `)
  })

  it(`Transforms queries and preserves variable type in useStaticQuery`, () => {
    matchesSnapshot(`
  import * as React from 'react'
  import { graphql, useStaticQuery } from 'gatsby'

  export default () => {
    const query = graphql\`{site { siteMetadata { title }}}\`
    let { site } = useStaticQuery(query)

    return (
      <h1>{site.siteMetadata.title}</h1>
    )
  }
  `)
  })

  it(`Transformation does not break custom hooks`, () => {
    matchesSnapshot(`
  import React from "react"
  import { graphql, useStaticQuery } from "gatsby"

  const useSiteMetadata = () => {
    const data = useStaticQuery(graphql\`{site { siteMetadata { title }}}\`)
    return data.site.siteMetadata
  }

  export default () => {
    const siteMetadata = useSiteMetadata()

    return <h1>{site.siteMetadata.title}</h1>
  }

  `)
  })

  it(`Transforms only the call expression in useStaticQuery`, () => {
    matchesSnapshot(`
  import React from "react"
  import { graphql, useStaticQuery } from "gatsby"

  const useSiteMetadata = () => {
    return useStaticQuery(
      graphql\`{site { siteMetadata { title }}}\`
    ).site.siteMetadata
  }

  export default () => {
    const siteMetadata = useSiteMetadata()

    return <h1>{siteMetadata.title}</h1>
  }
  `)
  })

  it(`Only runs transforms if useStaticQuery is imported from gatsby`, () => {
    matchesSnapshot(`
  import * as React from 'react'
  import { graphql } from 'gatsby'

  export default () => {
    const query = graphql\`{site { siteMetadata { title }}}\`
    const siteTitle = useStaticQuery(query)

    return (
      <h1>{siteTitle.site.siteMetadata.title}</h1>
    )
  }
  `)
  })

  it(`Allow alternative import of useStaticQuery`, () => {
    matchesSnapshot(`
  import * as React from 'react'
  import * as Gatsby from 'gatsby'

  export default () => {
    const query = Gatsby.graphql\`{site { siteMetadata { title }}}\`
    const siteTitle = Gatsby.useStaticQuery(query)

    return (
      <h1>{siteTitle.site.siteMetadata.title}</h1>
    )
  }
  `)
  })

  it(`Transforms queries in <StaticQuery>`, () => {
    matchesSnapshot(`
  import * as React from 'react'
  import { graphql, StaticQuery } from 'gatsby'

  export default () => (
    <StaticQuery
      query={graphql\`{site { siteMetadata { title }}}\`}
      render={data => <div>{data.site.siteMetadata.title}</div>}
    />
  )
  `)
  })

  it(`Transforms queries defined in own variable in <StaticQuery>`, () => {
    matchesSnapshot(`
  import * as React from 'react'
  import { graphql, StaticQuery } from 'gatsby'

  const query = graphql\`{site { siteMetadata { title }}}\`

  export default () => (
    <StaticQuery
      query={query}
      render={data => <div>{data.site.siteMetadata.title}</div>}
    />
  )
  `)
  })

  it(`transforms exported variable queries in <StaticQuery>`, () => {
    matchesSnapshot(`
  import * as React from 'react'
  import { graphql, StaticQuery } from 'gatsby'

  export const query = graphql\`{site { siteMetadata { title }}}\`

  export default () => (
    <StaticQuery
      query={query}
      render={data => <div>{data.site.siteMetadata.title}</div>}
    />
  )
  `)
  })

  it(`Transforms queries in page components`, () => {
    matchesSnapshot(`
  import { graphql } from 'gatsby'

  export const query = graphql\`
     {
       site { siteMetadata { title }}
     }
  \`
  `)
  })

  it(`allows the global tag`, () => {
    matchesSnapshot(
      `
  export const query = graphql\`
     {
       site { siteMetadata { title }}
     }
  \`
  `
    )
  })

  it(`distinguishes between the right tags`, () => {
    matchesSnapshot(
      `
  const foo = styled('div')\`
     {
       $\{foo}
     }
  \`

  const pulse = keyframes\`
    0% {
      transform: scale(1);
      animation-timing-function: ease-in;
    }
    25% {
      animation-timing-function: ease-out;
      transform: scale(1.05);
    }
    50% {
      transform: scale(1.12);
      animation-timing-function: ease-in;
    }
    to {
      transform: scale(1);
      animation-timing-function: ease-out;
    }
  \`;

  export const query = graphql\`
     {
       site { siteMetadata { title }}
     }
  \`
  `
    )
  })

  it(`handles import aliasing`, () => {
    matchesSnapshot(
      `
  import { graphql as gql } from 'gatsby'

  export const query = gql\`
     {
       site { siteMetadata { title }}
     }
  \`
  `
    )
  })

  it(`handles require`, () => {
    matchesSnapshot(
      `
  const { graphql } = require('gatsby')

  export const query = graphql\`
     {
       site { siteMetadata { title }}
     }
  \`
  `
    )
  })

  it(`handles require namespace`, () => {
    matchesSnapshot(
      `
  const Gatsby = require('gatsby')

  export const query = Gatsby.graphql\`
     {
       site { siteMetadata { title }}
     }
  \`
  `
    )
  })
  it(`handles require alias`, () => {
    matchesSnapshot(
      `
  const { graphql: gql } = require('gatsby')

  export const query = gql\`
     {
       site { siteMetadata { title }}
     }
  \`
  `
    )
  })

  it(`Leaves other graphql tags alone`, () => {
    matchesSnapshot(
      `
  import * as React from 'react'
  import { graphql } from 'relay'

  export default () => (
    <div>{data.site.siteMetadata.title}</div>
  )

  export const query = graphql\`
     {
       site { siteMetadata { title }}
     }
  \`
  `
    )
  })

  it(`Removes all gatsby queries`, () => {
    matchesSnapshot(
      `
  import { graphql } from 'gatsby'

  export default () => (
    <div>{data.site.siteMetadata.title}</div>
  )

  export const siteMetaQuery = graphql\`
    fragment siteMetaQuery on RootQueryType {
      site {
        siteMetadata {
          title
        }
      }
    }
  \`

  export const query = graphql\`
     {
       ...siteMetaQuery
     }
  \`
  `
    )
  })

  it(`Handles closing StaticQuery tag`, () => {
    matchesSnapshot(`
  import * as React from 'react'
  import { graphql, StaticQuery } from 'gatsby'

  export default () => (
    <StaticQuery
      query={graphql\`{site { siteMetadata { title }}}\`}
    >
      {data => <div>{data.site.siteMetadata.title}</div>}
    </StaticQuery>
  )
  `)
  })

  it(`Doesn't add data import for non static queries`, () => {
    matchesSnapshot(`
  import * as React from 'react'
  import { StaticQuery, graphql } from "gatsby"

  const Test = () => (
    <StaticQuery
      query={graphql\`
      {
        site {
          siteMetadata {
            title
          }
        }
      }
      \`}
      render={data => <div>{data.site.siteMetadata.title}</div>}
    />
  )

  export default Test

  export const fragment = graphql\`
    fragment MarkdownNodeFragment on MarkdownRemark {
      html
    }
  \`
  `)
  })

  it(`Replaces graphql query inside config with global call`, () => {
    matchesSnapshot(`
  import * as React from 'react'
  import { graphql } from "gatsby"

  const Test = () => (
    <div></div>
  )

  export default Test

  export async function config() {
    const data = graphql\`{ __typename }\`

    return () => {
      return {
        defer: true
      }
    }
  }
  `)
  })

  it(`validates that config export is async`, () => {
    const run = (): any =>
      transform(
        `
  import * as React from 'react'
  import { graphql } from "gatsby"

  const Test = () => (
    <div></div>
  )

  export default Test

  export function config() {
    const data = graphql\`{ __typename }\`

    return () => {
      return {
        defer: true
      }
    }
  }
  `
      )
    expect(run).toThrowErrorMatchingInlineSnapshot(
      `"unknown file: BabelPluginRemoveGraphQLQueries: the \\"config\\" export must be async when using it with graphql"`
    )
  })
})
