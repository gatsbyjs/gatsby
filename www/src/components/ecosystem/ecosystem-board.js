/** @jsx jsx */
import { jsx } from "theme-ui"
import { Component } from "react"
import PropTypes from "prop-types"

import EcosystemSection from "./ecosystem-section"
import { mediaQueries } from "../../gatsby-plugin-theme-ui"
import {
  setupScrollersObserver,
  unobserveScrollers,
} from "../../utils/scrollers-observer"

class EcosystemBoard extends Component {
  componentDidMount() {
    setupScrollersObserver()
  }

  componentWillUnmount() {
    unobserveScrollers()
  }

  render() {
    const {
      icons: {
        plugins: PluginsIcon,
        starters: StartersIcon,
        themes: ThemesIcon,
      },
      starters,
      plugins,
      themes,
    } = this.props

    return (
      <div
        sx={{
          display: `flex`,
          flexDirection: `column`,
          flexWrap: `wrap`,
          justifyContent: `center`,
          [mediaQueries.md]: {
            flexDirection: `row`,
            flexWrap: `wrap`,
            height: t =>
              `calc(100vh - (${t.sizes.bannerHeight} + ${t.sizes.headerHeight} + 1px))`,
            pt: 7,
            px: 4,
            pb: 4,
          },
        }}
      >
        <EcosystemSection
          title="Plugins"
          description="Plugins are packages that extend Gatsby sites. They can source content, transform data, and more!"
          subTitle="Featured Plugins"
          icon={PluginsIcon}
          links={[
            { label: `Browse Plugins`, to: `/plugins/` },
            {
              label: `Creating Plugins`,
              to: `/docs/creating-plugins/`,
              secondary: true,
            },
            { label: `Using Plugins`, to: `/docs/plugins/`, secondary: true },
          ]}
          featuredItems={plugins}
        />
        <EcosystemSection
          title="Starters"
          description="Starters are Gatsby sites that are preconfigured for different use cases to give you a head start for your project."
          subTitle="Featured Starters"
          icon={StartersIcon}
          links={[
            { label: `Browse Starters`, to: `/starters/` },
            { label: `Using Starters`, to: `/docs/starters/`, secondary: true },
          ]}
          featuredItems={starters}
        />
        <EcosystemSection
          title="Themes"
          description="Themes are packages that add preconfigured functionality to Gatsby sites. You can update central themes across sites and use multiple themes in your project!"
          subTitle="Featured Themes – work in progress"
          icon={ThemesIcon}
          links={[
            {
              label: `Browse Themes`,
              tag: `href`,
              to: `https://themejam.gatsbyjs.org/showcase`,
            },
            { label: `Using Themes`, to: `/docs/themes/`, secondary: true },
            {
              label: `Building Themes`,
              to: `/docs/themes/building-themes/`,
              secondary: true,
            },
          ]}
          featuredItems={themes}
        />
        <EcosystemSection
          title="External Resources"
          description="A curated list of interesting Gatsby community projects and learning resources like podcasts and tutorials."
          links={[{ label: `Browse Resources`, to: `/docs/awesome-gatsby/` }]}
        />
      </div>
    )
  }
}

EcosystemBoard.propTypes = {
  icons: PropTypes.object,
  starters: PropTypes.array,
  plugins: PropTypes.array,
}

export default EcosystemBoard
