import React from "react"
import Img from "gatsby-image"
import styled from "react-emotion"

import Navigation from "./navigation"
import { rhythm } from "../utils/typography"
import logo from "../images/monogram.svg"
import { mq, elevation, offset, offsetXxl, gutter } from "../utils/presets"

const Container = styled(`div`)`
  background: #fff;
  margin-top: calc(67vh - ${gutter.default});
  padding: ${gutter.default};
  position: relative;

  ${mq.tablet} {
    background: #fff;
    margin-left: ${offset};
    margin-top: 0;
    max-width: 37.5rem;
    padding: ${gutter.tablet};
    position: relative;
  }

  ${mq.desktop} {
    padding: ${gutter.desktop};
    padding-top: ${gutter.tablet};
  }

  ${mq.xxl} {
    margin-left: ${offsetXxl};
  }
`

const Image = styled(Img)`
  bottom: 33vh;
  left: ${gutter.default};
  right: ${gutter.default};
  top: ${gutter.default};

  ${mq.tablet} {
    bottom: 0;
    left: 0;
    right: auto;
    top: 0;
    width: ${offset};
  }

  ${mq.xxl} {
    width: ${offsetXxl};
  }
`

const Main = styled(`main`)`
  background: #fff;
  padding-top: ${gutter.default};
  position: relative;
  z-index: ${elevation.overlay};
`

const LogoLink = styled(`a`)`
  height: ${rhythm(0.875)};
  line-height: 1;
  position: fixed;
  top: ${gutter.tablet};
  right: ${gutter.tablet};
  width: ${rhythm(0.875)};

  && {
    background: transparent;
  }

  ${mq.tablet} {
    bottom: ${gutter.tablet};
    left: ${gutter.tablet};
    top: auto;
    z-index: ${elevation.overlay + 1};
  },
`

const Logo = styled(`img`)`
  display: inline-block;
  height: 100%;
  margin: 0;
  vertical-align: middle;
  width: 100%;
`

const Layout = ({ children, image, imageTitle, imageBackgroundColor }) => (
  <Container>
    {image && (
      <Image
        fluid={image}
        style={{ position: `fixed` }}
        backgroundColor={imageBackgroundColor ? imageBackgroundColor : false}
        title={imageTitle}
      />
    )}
    <Navigation />
    <Main>
      {children}
      <h2>Documentation & related links</h2>
      <ul>
        <li>
          See the
          {` `}
          <a href="https://www.gatsbyjs.org/packages/gatsby-image/">
            <code>gatsby-image</code> project README
          </a>
          {` `} for documentation on using the plugin
        </li>
        <li>
          Read the docs on
          {` `}“
          <a href="https://www.gatsbyjs.org/docs/using-gatsby-image/">
            Using gatsby-image to prevent image bloat
          </a>
          ”
        </li>
        <li>
          View the <code>gatsby-transformer-sharp</code> example at
          {` `}
          <a href="https://image-processing.gatsbyjs.org/">
            <code>image-processing.gatsbyjs.org</code>
          </a>
        </li>
      </ul>
    </Main>
    <LogoLink href="https://www.gatsbyjs.org/">
      <Logo src={logo} alt="Gatsby" />
    </LogoLink>
  </Container>
)

export default Layout
