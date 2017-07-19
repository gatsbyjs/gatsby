import React from "react"
import { fontFace, injectGlobal } from "emotion"
import styled from "emotion/react"

injectGlobal`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`

fontFace`
  font-family: system-ui;
  font-style: normal;
  font-weight: 400;
  src: local(".SFNSText-Regular"), local(".HelveticaNeueDeskInterface-Regular"), local(".LucidaGrandeUI"), local("Segoe UI"), local("Ubuntu"), local("Roboto-Regular"), local("DroidSans"), local("Tahoma");
`

const Wrapper = styled.section`
  align-items: center;
  background: #282a36;
  display: flex;
  flex-direction: column;
  font-family: system-ui;
  height: 100vh;
  justify-content: center;
  width: 100vw;
`

const Title = styled.h1`
  font-size: 1.5em;
  color: #ff79c6;
  margin-bottom: .5em;
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

const IndexPage = () =>
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

export default IndexPage
