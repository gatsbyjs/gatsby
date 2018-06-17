import React from "react"
import Container from "../components/container"
import Layout from "../components/layout"

class FourOhFour extends React.Component {
  render() {
    return (
      <Layout location={this.props.location}>
        <Container>
          <h1>Page not found</h1>
        </Container>
      </Layout>
    )
  }
}

export default FourOhFour
