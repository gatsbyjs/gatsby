const babel = require(`babel-core`)
const reactPreset = require(`@babel/preset-react`)
const plugin = require(`../`)

var staticQuery = `
import React from 'react'
import { graphql, StaticQuery } from 'gatsby'

export default () => (
  <StaticQuery
    query={graphql\`{site { siteMetadata { title }}}\`}
    render={data => <div>{data.site.siteMetadata.title}</div>}
  />
)
`

var pageComponent = `
import React from 'react'
import { graphql } from 'gatsby'

export default () => (
  <div>{data.site.siteMetadata.title}</div>
)

export const query = graphql\`
   {
     site { siteMetadata { title }}
   }
\`
`

it(`Transforms queries in <StaticQuery>`, () => {
  const { code } = babel.transform(staticQuery, {
    presets: [reactPreset],
    plugins: [plugin],
  })
  expect(code).toMatchSnapshot()
})

it(`Transforms queries in page components`, () => {
  const { code } = babel.transform(pageComponent, {
    presets: [reactPreset],
    plugins: [plugin],
  })
  expect(code).toMatchSnapshot()
})

it(`allows the global tag`, () => {
  const { code } = babel.transform(
    `
  import React from 'react'

  export default () => (
    <div>{data.site.siteMetadata.title}</div>
  )

  export const query = graphql\`
     {
       site { siteMetadata { title }}
     }
  \`
  `,
    {
      presets: [reactPreset],
      plugins: [plugin],
    }
  )
  expect(code).toMatchSnapshot()
})

it(`Leaves other graphql tags alone`, () => {
  const { code } = babel.transform(
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
  `,
    {
      presets: [reactPreset],
      plugins: [plugin],
    }
  )
  expect(code).toMatchSnapshot()
})
