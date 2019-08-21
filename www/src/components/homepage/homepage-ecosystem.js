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

import { EcosystemIcon } from "../../assets/icons"
import { PluginsIcon, StartersIcon } from "../../assets/icons/ecosystem-icons"

import {
  colors,
  space,
  radii,
  shadows,
  mediaQueries,
  fontSizes,
  letterSpacings,
  fonts,
} from "../../utils/presets"

import { SCROLLER_CLASSNAME } from "../../utils/scrollers-observer"

const Sections = styled(`div`)`
  display: flex;
  flex-direction: column;

  ${mediaQueries.md} {
    flex-direction: row;
    margin: 0 -${space[2]};
  }
`

const Section = styled(EcosystemSection)`
  box-shadow: ${shadows.raised};
  border-radius: ${radii[2]}px;
  margin-bottom: ${space[6]};
  padding: ${space[6]};

  ${mediaQueries.md} {
    margin: 0 ${space[2]} 0;
    padding: ${space[6]};

    :last-child {
      align-self: stretch;
    }
  }
`

const SubTitle = styled(`h3`)`
  font-size: ${fontSizes[3]};
  margin-bottom: ${space[1]};
  margin-top: ${space[7]};

  ${mediaQueries.lg} {
    margin-left: ${space[9]};
    margin-bottom: ${space[4]};
  }
`

const FeaturedItems = styled(HorizontalScroller)`
  margin: 0 -${space[6]};

  ${mediaQueries.lg} {
    margin: 0;
    overflow-x: visible;
  }
`

const FeaturedItemsList = styled(HorizontalScrollerContent)`
  ${mediaQueries.lg} {
    flex-wrap: wrap;
    margin: 0;
    padding: 0;
    width: 100%;
  }
`

const FeaturedItem = styled(EcosystemFeaturedItem)`
  margin-right: ${space[6]};

  ${mediaQueries.md} {
    border-bottom: none;
    margin: ${space[6]};
    margin-top: 0;
    margin-left: 0;
    width: 20rem;
  }

  ${mediaQueries.lg} {
    flex-basis: 28%;

    :nth-of-type(4) {
      margin-left: 8%;
    }
  }

  ${FeaturedItemBlockLink} {
    padding-left: calc(${space[5]} + ${space[6]});
    position: relative;
    border: 0;
    box-shadow: ${shadows.raised};

    ${mediaQueries.md} {
      border-radius: ${radii[2]}px;
    }

    ${mediaQueries.lg} {
      :hover {
        background: ${colors.ui.hover};
      }
    }

    :before {
      background: ${props =>
        props.item.type === `Starter` ? colors.teal[10] : colors.orange[20]};
      border-radius: ${radii[2]}px 0 0 ${radii[2]}px;
      bottom: 0;
      content: "";
      left: 0;
      position: absolute;
      top: 0;
      width: ${space[5]};
    }

    :after {
      bottom: 0;
      content: "${props => props.item.type}";
      color: ${props =>
        props.item.type === `Starter` ? colors.blue[70] : colors.orange[90]};
      font-family: ${fonts.header};
      font-size: ${fontSizes[1]};
      left: 0;
      letter-spacing: ${letterSpacings.tracked};
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
            to: `/docs/creating-plugins/`,
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
