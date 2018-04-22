import React from "react"
import Container from "../components/container"
import GlobalLayout from "../layouts"

class FourOhFour extends React.Component {
  render() {
    return (
      <GlobalLayout location={this.props.location}>
        <Container>
          <h1>Page not found</h1>
        </Container>
      </GlobalLayout>
    )
  }
}

export default FourOhFour
