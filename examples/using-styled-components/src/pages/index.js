import React, { Fragment } from "react"
import { Helmet } from "react-helmet"
import styled, { createGlobalStyle } from "styled-components"

const GlobalStyle = createGlobalStyle`
  html {
    background-color: #fafaf3;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='72' viewBox='0 0 36 72'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23d2d0b3' fill-opacity='0.4'%3E%3Cpath d='M2 6h12L8 18 2 6zm18 36h12l-6 12-6-12z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
`

// Create a Title component that'll render an <h1> tag with some styles
const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: palevioletred;
`

// Create an ExternalLink component that'll render an <a> tag with some styles
const ExternalLink = styled.a`
  text-decoration: none;
  color: #1e88e5;
`

// Create a Wrapper component that'll render a <section> tag with some styles
const Wrapper = styled.section`
  text-align: center;
  border-radius: 10px;
  padding: 5.5rem;
  background: papayawhip;
  margin: 3rem auto 0 auto;
  max-width: 800px;
`

class IndexPage extends React.Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>Gatsby Styled Components</title>
          <meta
            name="description"
            content="Gatsby example site using Styled Components"
          />
          <meta name="referrer" content="origin" />
        </Helmet>
        <GlobalStyle />
        <Wrapper>
          <Title>Hello World, this is my first styled component!</Title>
          <p>
            <ExternalLink href="https://www.gatsbyjs.org/packages/gatsby-plugin-styled-components/">
              gatsby-plugin-styled-component docs
            </ExternalLink>
          </p>
        </Wrapper>
      </Fragment>
    )
  }
}

export default IndexPage
