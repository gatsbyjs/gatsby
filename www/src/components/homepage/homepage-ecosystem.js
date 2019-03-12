import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"

import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

import HomepageSection from "./homepage-section"
import EcosystemSection from "../ecosystem/ecosystem-section"
import EcosystemFeaturedItem, {
  BlockLink as FeaturedItemBlockLink,
} from "../ecosystem/ecosystem-featured-item"

import {
  HorizontalScroller,
  HorizontalScrollerContent,
} from "../shared/horizontal-scroller"

import { EcosystemIcon } from "../../assets/mobile-nav-icons"
import { PluginsIcon, StartersIcon } from "../../assets/ecosystem-icons"

import { rhythm, options } from "../../utils/typography"
import presets, { colors, space, radii } from "../../utils/presets"

import { SCROLLER_CLASSNAME } from "../../utils/scrollers-observer"

const Sections = styled(`div`)`
  display: flex;
  flex-direction: column;

  ${presets.Md} {
    flex-direction: row;
    margin: 0 -8px;
  }
`

const Section = styled(EcosystemSection)`
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
  border-radius: ${radii[2]}px;
  margin-bottom: ${rhythm(space[6])};
  padding: ${rhythm(space[6])};

  ${presets.Md} {
    margin: 0 8px 0px;
    padding: ${rhythm(space[6])};

    :last-child {
      align-self: stretch;
    }
  }
`

const SubTitle = styled(`h3`)`
  color: ${colors.lemon};
  font-size: ${presets.scale[3]};
  margin-bottom: ${rhythm(space[1])};
  margin-top: ${rhythm(space[7])};

  ${presets.Lg} {
    margin-left: ${rhythm(space[9])};
    margin-bottom: ${rhythm(space[4])};
  }
`

const FeaturedItems = styled(HorizontalScroller)`
  margin: 0 -${rhythm(space[6])};

  ${presets.Lg} {
    margin: 0;
    overflow-x: visible;
  }
`

const FeaturedItemsList = styled(HorizontalScrollerContent)`
  ${presets.Lg} {
    flex-wrap: wrap;
    margin: 0;
    padding: 0;
    width: 100%;
  }
`

const FeaturedItem = styled(EcosystemFeaturedItem)`
  margin-right: ${rhythm(space[6])};

  ${presets.Md} {
    border-bottom: none;
    margin: ${rhythm(space[6])};
    margin-top: 0;
    margin-left: 0;
    width: 320px;
  }

  ${presets.Lg} {
    flex-basis: 28%;

    :nth-of-type(4) {
      margin-left: 8%;
    }
  }

  ${FeaturedItemBlockLink} {
    padding-left: calc(${rhythm(space[6])} + 1.1rem);
    position: relative;

    ${presets.Md} {
      border-radius: ${radii[2]}px;
    }

    ${presets.Lg} {
      :hover {
        background: ${colors.ui.whisper};
      }
    }

    :before {
      background: ${props =>
        props.item.type === `Starter` ? colors.skyLight : colors.accentLight};
      border-radius: ${radii[2]}px 0 0 ${radii[2]}px;
      bottom: 0;
      content: "";
      left: 0;
      position: absolute;
      top: 0;
      width: 1.1rem;
    }

    :after {
      bottom: 0;
      content: "${props => props.item.type}";
      color: ${props =>
        props.item.type === `Starter` ? colors.skyDark : colors.accentDark};
      font-family: ${options.headerFontFamily.join(`,`)};
      font-size: ${presets.scale[1]};
      left: 0;
      letter-spacing: ${presets.letterSpacings.tracked};
      position: absolute;
      transform: rotate(-90deg) translate(-0.5em, -0);
      transform-origin: top left;
    }
  }
`

const HomepageEcosystem = ({ featuredItems }) => (
  <HomepageSection
    sectionName="Ecosystem"
    sectionIcon={EcosystemIcon}
    title="Plugins & Starters"
    introduction="We have the tools to help you build for the web."
    links={[
      {
        label: `Explore the Gatsby Ecosystem`,
        to: `/ecosystem/`,
        icon: ArrowForwardIcon,
        tracking: `Plugins - Explore the Gatsby Ecosystem`,
      },
    ]}
    inverseStyle={true}
  >
    <Sections>
      <Section
        title="Plugins"
        description="Plugins are packages that extend Gatsby sites. They can source content, transform data, and more!"
        icon={PluginsIcon}
        links={[
          { label: `Browse Plugins`, to: `/plugins/` },
          {
            label: `Creating Plugins`,
            to: `/docs/plugin-authoring/`,
            secondary: true,
          },
          { label: `Using Plugins`, to: `/docs/plugins/`, secondary: true },
        ]}
        onHomepage={true}
      />

      <Section
        title="Starters"
        description="Starters are Gatsby sites that are preconfigured for different use cases to give you a head start for your project."
        icon={StartersIcon}
        links={[
          { label: `Browse Starters`, to: `/starters/` },
          { label: `Using Starters`, to: `/docs/starters/`, secondary: true },
        ]}
      />
      <Section
        title="External Resources"
        description="A curated list of interesting Gatsby community projects and learning resources like podcasts and tutorials."
        links={[{ label: `Browse Resources`, to: `/docs/awesome-gatsby/` }]}
      />
    </Sections>
    <SubTitle>Some of our recent favorites</SubTitle>
    <FeaturedItems className={SCROLLER_CLASSNAME}>
      <FeaturedItemsList>
        {featuredItems.map(item => {
          const { slug } = item
          return <FeaturedItem key={slug} item={item} />
        })}
      </FeaturedItemsList>
    </FeaturedItems>
  </HomepageSection>
)

HomepageEcosystem.propTypes = {
  featuredItems: PropTypes.array.isRequired,
}

export default HomepageEcosystem
