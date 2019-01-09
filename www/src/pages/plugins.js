import React, { Component } from "react"
import Layout from "../components/layout"
import Container from "../components/container"
import PageWithPluginSearchBar from "../components/page-with-plugin-searchbar"
import Unbird from "../components/unbird"
import { Link } from "gatsby"
import logo from "../monogram.svg"
import { rhythm, options } from "../utils/typography"
import presets, { colors } from "../utils/presets"

class Plugins extends Component {
  render() {
    return (
      <Layout location={this.props.location}>
        <PageWithPluginSearchBar isPluginsIndex location={this.props.location}>
          <Container
            css={{
              alignItems: `center`,
              display: `flex`,
              minHeight: `calc(100vh - (${presets.headerHeight} + ${
                presets.bannerHeight
              }))`,
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
                  height: rhythm(5.2),
                  width: rhythm(5.2),
                  marginLeft: `auto`,
                  marginRight: `auto`,
                }}
                alt=""
              />
              <h1
                css={{
                  fontSize: rhythm(1),
                  marginTop: rhythm(1 / 4),
                  marginLeft: rhythm(1),
                  marginRight: rhythm(1),
                  textAlign: `center`,
                }}
              >
                Welcome to the Gatsby Plugin Library!
              </h1>
              <p
                css={{
                  color: colors.gray.calm,
                  marginLeft: rhythm(3),
                  marginRight: rhythm(3),
                  fontSize: rhythm(3 / 4),
                  fontFamily: options.headerFontFamily.join(`,`),
                  textAlign: `center`,
                }}
              >
                Please use the search bar to find plugins that will make your
                blazing fast site even more awesome. If you
                {`'`}d like to create your own plugin, see the
                {` `}
                <Link to="/docs/plugin-authoring/">Plugin Authoring</Link> page
                in the docs! To learn more about Gatsby plugins, visit the
                {` `}
                <Link to="/docs/plugins">plugins doc page</Link>.
              </p>
            </div>
            <Unbird
              dataSetId="5c1ac24b4a828a169b6c235c"
              publicKey={process.env.UNBIRD_FEEDBACK_KEY_PLUGINLIB}
              feedbackPrompt="Have feedback on the Plugin Library?"
            />
          </Container>
        </PageWithPluginSearchBar>
      </Layout>
    )
  }
}

export default Plugins
