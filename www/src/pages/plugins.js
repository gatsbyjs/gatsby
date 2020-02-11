/** @jsx jsx */
import { jsx } from "theme-ui"
import React, { Component } from "react"
import { Helmet } from "react-helmet"

import Container from "../components/container"
import Rotator from "../components/rotator"
import { Link } from "gatsby"
import logo from "../assets/monogram.svg"
import { sizes } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import FooterLinks from "../components/shared/footer-links"
import Layout from "../components/layout"
import PageWithPluginSearchBar from "../components/page-with-plugin-searchbar"

class Plugins extends Component {
  render() {
    const { location } = this.props
    return (
      <Layout location={location}>
        <PageWithPluginSearchBar location={location} isPluginsIndex={true}>
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
                sx={{
                  display: `inline-block`,
                  height: t => t.space[12],
                  width: t => t.space[12],
                  mx: `auto`,
                }}
                alt=""
              />
              <h1
                sx={{
                  fontSize: 6,
                  fontWeight: `heading`,
                  mx: 5,
                  mb: 0,
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
                    text: `WordPress integration?`,
                    pluginName: `gatsby-source-wordpress`,
                  },
                  {
                    text: `anything?`,
                  },
                ]}
                color="lilac"
              />

              <p
                sx={{
                  color: `textMuted`,
                  fontSize: 2,
                  textAlign: `center`,
                }}
              >
                Please use the search bar to find plugins that will make your
                blazing fast site even more awesome. If you
                {`'`}d like to create your own plugin, see the
                {` `}
                <Link to="/docs/creating-plugins/">Plugin Authoring</Link> page
                in the docs! To learn more about Gatsby plugins, visit the
                {` `}
                <Link to="/docs/plugins">plugins doc page</Link>.
              </p>
            </div>
            <FooterLinks />
          </Container>
        </PageWithPluginSearchBar>
      </Layout>
    )
  }
}

export default Plugins
