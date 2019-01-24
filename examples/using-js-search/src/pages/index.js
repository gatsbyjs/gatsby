import React from 'react'
import Layout from '../components/layout'
import Search from '../components/SearchContainer'

const IndexPage = () => (
  <Layout>
    <h1 style={{ marginTop: `3em`, textAlign: `center` }}>
      Search data using JS Search
    </h1>
    <h3 style={{ marginTop: `2em`, padding: `2em 0em`, textAlign: `center` }}>
      Books Indexed by:
    </h3>
    <div>
      <Search />
    </div>
  </Layout>
)

export default IndexPage
