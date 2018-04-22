const babel = require("babel-core")
const reactPreset = require("@babel/preset-react")
const plugin = require("../")

var staticQuery = `
import React from 'react'
import { StaticQuery } from 'gatsby'

export default () => (
  <StaticQuery
    query={graphql\`{site { siteMetadata { title }}}\`}
    render={data => <div>{data.site.siteMetadata.title}</div>}
  />
)
`

var pageComponent = `
import React from 'react'

export default () => (
  <div>{data.site.siteMetadata.title}</div>
)

export const query = graphql\`
   {
     site { siteMetadata { title }}
   }
\`
`

it("Transforms queries in <StaticQuery>", () => {
  const { code } = babel.transform(staticQuery, {
    presets: [reactPreset],
    plugins: [plugin],
  })
  expect(code).toMatchSnapshot()
})

it("Transforms queries in page components", () => {
  const { code } = babel.transform(pageComponent, {
    presets: [reactPreset],
    plugins: [plugin],
  })
  expect(code).toMatchSnapshot()
})
