import React from "react"
import { Link } from "gatsby"
import Layout from "../components/layout"
import Container from "../components/container"
import FooterLinks from "../components/shared/footer-links"

const FourOhFour = props => (
  <Layout location={props.location}>
    <Container>
      <h1>Page not found</h1>
      <p>Oops! The page you are looking for has been removed or relocated.</p>
      <Link to="/" title="Go Back To Home Page">
        <p>Go Back</p>
      </Link>
    </Container>
    <FooterLinks />
  </Layout>
)
export default FourOhFour
