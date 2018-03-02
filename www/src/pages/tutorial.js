import React from "react"
import Helmet from "react-helmet"
import Link from "gatsby-link"

import Container from "../components/container"

export default (props) => (
  <Container>
    <Helmet>
      <title>Getting Started</title>
    </Helmet>
    <h1 css={{ marginTop: 0 }}>{props.data.markdownRemark.frontmatter.title}</h1>
    <section dangerouslySetInnerHTML={{__html: props.data.markdownRemark.html}} />
  </Container>
)

export const query = graphql`
query tutorialquery {
  markdownRemark(id: {regex: "/docs/tutorial/index.md/"}) {
    html
    frontmatter {
      title
    }
  }
}
`