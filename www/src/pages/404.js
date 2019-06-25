import React from "react"
import Container from "../components/container"
import Layout from "../components/layout"
import { Link } from "gatsby"
import FooterLinks from "../components/shared/footer-links"

class FourOhFour extends React.Component {
  render() {
    return (
      <Layout location={this.props.location}>
        <Container>
          <h1>Page not found</h1>
          <p>
            Oops! The page you are looking for has been removed or relocated.
          </p>
          <Link to="/">
            <p>Go Back</p>
          </Link>
        </Container>
        <FooterLinks />
      </Layout>
    )
  }
}

export default FourOhFour
