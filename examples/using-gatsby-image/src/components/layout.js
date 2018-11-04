import React from "react"
import Img from "gatsby-image"
import styled from "react-emotion"

import Navigation from "./navigation"
import { rhythm } from "../utils/typography"
import logo from "../images/monogram.svg"
import presets from "../utils/presets"

const { gutter } = presets

const Container = styled(`div`)`
  background: #fff;
  margin-top: calc(67vh - ${gutter.default});
  padding: ${gutter.default};
  position: relative;

  ${presets.Tablet} {
    background: #fff;
    margin-left: ${presets.offset};
    margin-top: 0;
    max-width: 600px;
    padding: ${gutter.tablet};
    position: relative;
  }

  ${presets.Desktop} {
    padding: ${presets.gutter.desktop};
  }

  ${presets.Xxl} {
    margin-left: ${presets.offsetXxl};
  }
`

const Image = styled(Img)`
  bottom: 33vh;
  left: ${presets.gutter.default};
  right: ${presets.gutter.default};
  top: ${presets.gutter.default};

  ${presets.Tablet} {
    bottom: 0;
    left: 0;
    right: auto;
    top: 0;
    width: ${presets.offset};
  }

  ${presets.Xxl} {
    width: ${presets.offsetXxl};
  }
`

const Main = styled(`main`)`
  background: #fff;
  padding-top: ${gutter.default};
  position: relative;
  z-index: ${presets.zIndex.overlay};
`

const LogoLink = styled(`a`)`
  height: ${rhythm(0.875)};
  line-height: 1;
  position: fixed;
  top: ${gutter.tablet}px;
  right: ${gutter.tablet}px;
  width: ${rhythm(0.875)};

  && {
    background: transparent;
  }

  ${presets.Tablet} {
    bottom: ${gutter.tablet}px;
    left: ${gutter.tablet}px;
    top: auto;
    z-index: ${presets.zIndex.overlay + 1};
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
      <h2>Documentation</h2>
      <ul>
        <li>
          See the
          {` `}
          <a href="https://www.gatsbyjs.org/packages/gatsby-image/">
            project README for documentation
          </a>
          {` `}
          on using the plugin.
        </li>
        <li>
          Read the docs on
          {` `}
          <a href="https://www.gatsbyjs.org/docs/using-gatsby-image/">
            using gatsby-image to prevent image bloat
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
