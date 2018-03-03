import React from "react"
import { injectGlobal } from "emotion"
import styled from "react-emotion"

injectGlobal`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`

injectGlobal`
  html, body {
    font-family: -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      "Roboto",
      "Roboto Light",
      "Oxygen",
      "Ubuntu",
      "Cantarell",
      "Fira Sans",
      "Droid Sans",
      "Helvetica Neue",
      sans-serif,
      "Apple Color Emoji",
      "Segoe UI Emoji",
      "Segoe UI Symbol";
  }
`

const Wrapper = styled.section`
  align-items: center;
  background: #282a36;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  width: 100vw;
`

const Title = styled.h1`
  font-size: 1.5em;
  color: #ff79c6;
  margin-bottom: 0.5em;
  & a {
    color: #8be9fd;
  }
`

const Subtitle = styled.p`
  color: #bd93f9;
  & a {
    color: inherit;
  }
`

const IndexPage = () => (
  <Wrapper>
    <Title>
      Hello World, this is my first component styled with{` `}
      <a href="https://emotion.sh/">emotion</a>!
    </Title>
    <Subtitle>
      <a href="https://www.gatsbyjs.org/packages/gatsby-plugin-emotion/">
        gatsby-plugin-emotion docs
      </a>
    </Subtitle>
  </Wrapper>
)

export default IndexPage
