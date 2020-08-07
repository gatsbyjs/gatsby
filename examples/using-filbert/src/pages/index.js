
import { Global, css, styled } from "@filbert-js/core"

import { Helmet } from "react-helmet"
import React from "react"

// Filbert supports different styling options, all of which are supported by gatsby-plugin-filbert out of the box

// Create styles for the Global component
const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  html,
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
      "Roboto Light", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
      "Helvetica Neue", sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
      "Segoe UI Symbol";
  }
`

// Using styled (similar API as styled-components)
const Wrapper = styled.section`
  align-items: center;
  background: #282a36;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  width: 100vw;
`

// Using css with a template literal
const title = css`
  font-size: 1.5em;
  color: white;
  margin-bottom: 0.5em;

  a {
    color: #8be9fd;
  }
`

const IndexPage = () => (
  <>
     <Helmet>
      <title>Gatsby Filbert</title>
      <meta name="description" content="Gatsby example site using Filbert" />
      <meta name="referrer" content="origin" />
    </Helmet>
    <Global styles={globalStyles} />
    <Wrapper>
      <h1 css={title}>
        Hello World, this is my first component styled with
        {` `}
        <a href="https://filbert-js.vercel.app/docs/introduction/">filbert</a>!
      </h1>
      <p
        css={css`
          color: #bd93f9;
        `}
      >
        <a
          href="https://www.gatsbyjs.org/packages/gatsby-plugin-filbert/"
          css={css`
            color: inherit;
          `}
        >
          gatsby-plugin-filbert docs
        </a>
      </p>
    </Wrapper>
  </>
)

export default IndexPage
