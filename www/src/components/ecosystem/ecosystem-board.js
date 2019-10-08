import React, { Component } from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"

import EcosystemSection from "./ecosystem-section"

import { space, mediaQueries, sizes } from "../../utils/presets"
import {
  setupScrollersObserver,
  unobserveScrollers,
} from "../../utils/scrollers-observer"

const EcosystemBoardRoot = styled(`div`)`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;

  ${mediaQueries.md} {
    flex-direction: row;
    flex-wrap: wrap;
    min-height: calc(
      100vh - (${sizes.bannerHeight} + ${sizes.headerHeight} + 1px)
    );
    padding: ${space[7]} ${space[4]} ${space[4]};
  }
`

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
      <EcosystemBoardRoot>
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
      </EcosystemBoardRoot>
    )
  }
}

EcosystemBoard.propTypes = {
  icons: PropTypes.object,
  starters: PropTypes.array,
  plugins: PropTypes.array,
}

export default EcosystemBoard
