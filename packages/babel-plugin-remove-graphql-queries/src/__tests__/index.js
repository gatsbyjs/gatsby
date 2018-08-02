const babel = require(`babel-core`)
const reactPreset = require(`@babel/preset-react`)
const plugin = require(`../`)

function matchesSnapshot(query) {
  const { code } = babel.transform(query, {
    presets: [reactPreset],
    plugins: [plugin],
  })
  expect(code).toMatchSnapshot()
}

it(`Transforms queries in <StaticQuery>`, () => {
  matchesSnapshot(`
  import React from 'react'
  import { graphql, StaticQuery } from 'gatsby'

  export default () => (
    <StaticQuery
      query={graphql\`{site { siteMetadata { title }}}\`}
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
  import React from 'react'
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
  import React from 'react'
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
