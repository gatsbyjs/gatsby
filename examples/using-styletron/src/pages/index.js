import React from "react"
import { styled } from "styletron-react"

// Create a Container element that'll render a <div> tag with some styles
const Container = styled(`div`, {
  margin: `0 auto`,
  marginTop: `3rem`,
  padding: `1.5rem`,
  maxWidth: 800,
  color: `red`,
})

// Create a Title element that'll render an <h1> tag with some styles
const Title = styled(`h1`, {
  fontSize: `1.5em`,
  textAlign: `center`,
  color: `#744d9e`,
})

// Create a Wrapper element that'll render a <section> tag with some styles
const Wrapper = styled(`div`, {
  padding: `4em`,
  background: `#f5f3f7`,
})

class IndexPage extends React.Component {
  render() {
    return (
      <Container>
        <Wrapper>
          <Title>
            Hello World, this is my first component styled with Styletron!
          </Title>
          <p>
            <a href="https://www.gatsbyjs.org/packages/gatsby-plugin-styletron/">
              gatsby-plugin-styletron docs
            </a>
          </p>
        </Wrapper>
      </Container>
    )
  }
}

export default IndexPage
