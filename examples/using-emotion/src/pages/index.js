import React, { Fragment } from "react"
import { Helmet } from "react-helmet"
import styled from "@emotion/styled"
import { Global } from "@emotion/react"
import { css } from "@emotion/css"

// Emotion supports different styling options, all of which are supported by gatsby-plugin-emotion out of the box

// Create styles for the Global component
const globalStyles = css`
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
  color: #ff79c6;
  margin-bottom: 0.5em;

  a {
    color: #8be9fd;
  }
`

const IndexPage = () => (
  <Fragment>
    <Helmet>
      <title>Gatsby Emotion</title>
      <meta name="description" content="Gatsby example site using Emotion" />
      <meta name="referrer" content="origin" />
    </Helmet>
    <Global styles={globalStyles} />
    <Wrapper>
      <h1 css={title}>
        Hello World, this is my first component styled with
        {` `}
        <a href="https://emotion.sh/">emotion</a>!
      </h1>
      <p
        // Styling "inline" via css prop and object styles
        css={{
          color: `#bd93f9`,
        }}
      >
        <a
          href="https://www.gatsbyjs.com/plugins/gatsby-plugin-emotion/"
          // Styling “inline” via css prop and a template literal
          css={css`
            color: inherit;
          `}
        >
          gatsby-plugin-emotion docs
        </a>
      </p>
    </Wrapper>
  </Fragment>
)

export default IndexPage
