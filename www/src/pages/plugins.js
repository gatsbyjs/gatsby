import React, { Component } from "react"
import { Helmet } from "react-helmet"

import Container from "../components/container"
import Rotator from "../components/rotator"
import { Link } from "gatsby"
import logo from "../assets/monogram.svg"
import { rhythm } from "../utils/typography"
import { colors, space, sizes, fontSizes } from "../utils/presets"
import FooterLinks from "../components/shared/footer-links"

class Plugins extends Component {
  render() {
    return (
      <>
        <Helmet>
          <title>Plugins</title>
          <meta
            name="description"
            content="The library for searching and exploring Gatsby's vast plugin ecosystem to implement Node.js packages using Gatsby APIs"
          />
        </Helmet>
        <Container
          overrideCSS={{
            alignItems: `center`,
            display: `flex`,
            flexDirection: `column`,
            minHeight: `calc(100vh - (${sizes.headerHeight} + ${sizes.bannerHeight}))`,
          }}
        >
          <div
            css={{
              display: `flex`,
              flexDirection: `column`,
            }}
          >
            <img
              src={logo}
              css={{
                display: `inline-block`,
                height: rhythm(3),
                width: rhythm(3),
                marginLeft: `auto`,
                marginRight: `auto`,
              }}
              alt=""
            />
            <h1
              css={{
                fontSize: fontSizes[6],
                fontWeight: `700`,
                marginLeft: space[5],
                marginRight: space[5],
                marginBottom: 0,
                textAlign: `center`,
              }}
            >
              Welcome to the Gatsby Plugin Library!
            </h1>
            <Rotator
              items={[
                {
                  text: `SEO?`,
                  pluginName: `gatsby-plugin-react-helmet`,
                },
                {
                  text: `responsive images?`,
                  pluginName: `gatsby-image`,
                },
                {
                  text: `offline support?`,
                  pluginName: `gatsby-plugin-offline`,
                },
                {
                  text: `Sass support?`,
                  pluginName: `gatsby-plugin-sass`,
                },
                {
                  text: `a sitemap?`,
                  pluginName: `gatsby-plugin-sitemap`,
                },
                {
                  text: `an RSS feed?`,
                  pluginName: `gatsby-plugin-feed`,
                },
                {
                  text: `great typography?`,
                  pluginName: `gatsby-plugin-typography`,
                },
                {
                  text: `TypeScript?`,
                  pluginName: `gatsby-plugin-typescript`,
                },
                {
                  text: `Google Analytics?`,
                  pluginName: `gatsby-plugin-google-analytics`,
                },
                {
                  text: `Wordpress integration?`,
                  pluginName: `gatsby-source-wordpress`,
                },
                {
                  text: `anything?`,
                },
              ]}
              color={colors.lilac}
            />

            <p
              css={{
                color: colors.text.secondary,
                fontSize: fontSizes[2],
                textAlign: `center`,
              }}
            >
              Please use the search bar to find plugins that will make your
              blazing fast site even more awesome. If you
              {`'`}d like to create your own plugin, see the
              {` `}
              <Link to="/docs/creating-plugins/">Plugin Authoring</Link> page in
              the docs! To learn more about Gatsby plugins, visit the
              {` `}
              <Link to="/docs/plugins">plugins doc page</Link>.
            </p>
          </div>
          <FooterLinks />
        </Container>
      </>
    )
  }
}

export default Plugins
