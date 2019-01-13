import React from 'react'
import { Container, Header } from 'semantic-ui-react'
import Layout from '../components/layout'
import Search from '../components/SearchContainer'
const style = {
  h1: {
    marginTop: `3em`,
  },
  h2: {
    margin: `4em 0em 2em`,
  },
  h3: {
    marginTop: `2em`,
    padding: `2em 0em`,
  },
  last: {
    marginBottom: `300px`,
  },
}

const IndexPage = () => (
  <Layout>
    <Header
      as="h1"
      content="Search data using JS Search"
      style={style.h1}
      textAlign="center"
    />
    <Header
      as="h3"
      textAlign="center"
      style={style.h3}
      content="Books Indexed by:"
    />
    <Container>
      <Search />
    </Container>
  </Layout>
)

export default IndexPage
