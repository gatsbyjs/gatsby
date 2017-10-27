import React from "react"
import Link from "gatsby-link"
import SearchIcon from "react-icons/lib/md/search"
import "typeface-rochester"
import "typeface-josefin-sans"
import "typeface-josefin-slab"

import { rhythm, scale } from "../utils/typography"
import constants from "../utils/constants"
import Container from "../components/container"

class DefaultLayout extends React.Component {
  render() {
    return (
      <div>
        <header
          css={{
            height: rhythm(1.5),
            width: `100%`,
            background: constants.paleYellow,
          }}
        >
          <SearchIcon
            css={{
              fontSize: rhythm(1),
              top: rhythm(0.25),
              position: `relative`,
              marginLeft: rhythm(1 / 2),
            }}
          />
          <span
            css={{
              float: `right`,
              marginRight: rhythm(1),
              lineHeight: rhythm(1.5),
            }}
          >
            Login
          </span>
        </header>
        <Container>
          <div css={{ width: 193, overflow: `hidden` }}>
            <h1
              css={{
                fontSize: scale(1.8).fontSize,
                margin: 0,
                fontFamily: `Rochester, serif`,
                float: `right`,
              }}
            >
              Umami
            </h1>
            <h4
              css={{
                fontFamily: `"Josefin Sans", sans-serif`,
                marginBottom: rhythm(1),
                float: `right`,
              }}
            >
              Food Magazine
            </h4>
          </div>
        </Container>
        {this.props.children()}
        <footer css={{ background: constants.paleYellow }}>
          <Container>
            <p>
              The src for this website is at
              {` `}
              <a href="https://github.com/gatsbyjs/gatsby/tree/1.0/examples/using-drupal">
                https://github.com/gatsbyjs/gatsby/tree/1.0/examples/using-drupal
              </a>
            </p>
            <p>
              The Drupal site that's providing the data for this site is at
              {` `}
              <a href="https://dev-gatsbyjs-d8.pantheonsite.io/">
                https://dev-gatsbyjs-d8.pantheonsite.io/
              </a>
            </p>
          </Container>
        </footer>
      </div>
    )
  }
}

export default DefaultLayout
