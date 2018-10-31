import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"

import EcosystemSection from "./ecosystem-section"

import presets, { colors } from "../../utils/presets"

const EcosystemBoardRoot = styled("div")`
  display: flex;
  flex-direction: column;

  ${presets.Tablet} {
    flex-direction: row;
    flex-wrap: wrap;
    height: calc(
      100vh - (${presets.bannerHeight} + ${presets.headerHeight} + 1px)
    );
    padding: 2rem 1rem 1rem;
  }
`

const EcosystemBoard = ({
  icons: { plugins: PluginsIcon, starters: StartersIcon },
  starters,
  plugins,
  background,
}) => {
  return (
    <EcosystemBoardRoot>
      <EcosystemSection
        title="Plugins"
        description="With 429 plugins, lorem ipsum sunt we need some proper copy here pulling in data from your favorite source is only a few mouseclicks away."
        subTitle="Featured Plugins"
        icon={PluginsIcon}
        links={[
          { label: "Browse Plugins", to: "/plugins/" },
          {
            label: "Plugin Authoring",
            to: "/docs/plugin-authoring/",
            secondary: true,
          },
          { label: "Plugin Docs", to: "/docs/plugins/", secondary: true },
        ]}
        featuredItems={plugins}
      />
      <EcosystemSection
        title="Starters"
        description="Starters are boilerplate Gatsby sites maintained by the community which give you a headstart for your Gatsby project."
        subTitle="Featured Starters"
        icon={StartersIcon}
        links={[
          { label: "Browse Starters", to: "/starters/" },
          { label: "Starter Docs", to: "/docs/starters/", secondary: true },
        ]}
        featuredItems={starters}
      />
      <EcosystemSection
        title="External Resources"
        description="More awesome Gatsby content, created by the community."
        links={[{ label: "Browse Resources", to: "/docs/awesome-gatsby/" }]}
      />
    </EcosystemBoardRoot>
  )
}

EcosystemBoard.propTypes = {
  icons: PropTypes.object,
  starters: PropTypes.array,
  plugins: PropTypes.array,
}

export default EcosystemBoard
