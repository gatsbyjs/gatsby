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
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import { SCROLLER_CLASSNAME } from "../../utils/scrollers-observer"

const Sections = styled(`div`)`
  display: flex;
  flex-direction: column;

  ${mediaQueries.md} {
    flex-direction: row;
    margin: 0 -${p => p.theme.space[2]};
  }
`

const Section = styled(EcosystemSection)`
  box-shadow: ${p => p.theme.shadows.raised};
  border-radius: ${p => p.theme.radii[2]};
  margin-bottom: ${p => p.theme.space[6]};
  padding: ${p => p.theme.space[6]};

  ${mediaQueries.md} {
    margin: 0 ${p => p.theme.space[2]} 0;
    padding: ${p => p.theme.space[6]};
    max-height: none;

    :last-child {
      align-self: stretch;
    }
  }
`

const SubTitle = styled(`h3`)`
  font-size: ${p => p.theme.fontSizes[3]};
  margin-bottom: ${p => p.theme.space[1]};
  margin-top: ${p => p.theme.space[7]};

  ${mediaQueries.lg} {
    margin-left: ${p => p.theme.space[9]};
    margin-bottom: ${p => p.theme.space[4]};
  }
`

const FeaturedItems = styled(HorizontalScroller)`
  margin: 0 -${p => p.theme.space[6]};

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
  margin-right: ${p => p.theme.space[6]};

  ${mediaQueries.md} {
    border-bottom: none;
    margin: ${p => p.theme.space[6]};
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
    padding-left: calc(${p => p.theme.space[5]} + ${props =>
  props.theme.space[6]});
    position: relative;
    border: 0;
    box-shadow: ${p => p.theme.shadows.raised};

    ${mediaQueries.md} {
      border-radius: ${p => p.theme.radii[2]};
    }

    ${mediaQueries.lg} {
      :hover {
        background: ${p => p.theme.colors.ui.hover};
      }
    }

    :before {
      background: ${props =>
        props.item.type === `Starter`
          ? props.theme.colors.card.starterLabelBackground
          : props.theme.colors.card.pluginLabelBackground};
      border-radius: ${p => p.theme.radii[2]} 0 0 ${props =>
  props.theme.radii[2]};
      bottom: 0;
      content: "";
      left: 0;
      position: absolute;
      top: 0;
      width: ${p => p.theme.space[5]};
    }

    :after {
      bottom: 0;
      content: "${props => props.item.type}";
      color: ${props =>
        props.item.type === `Starter`
          ? props.theme.colors.card.starterLabelText
          : props.theme.colors.card.pluginLabelText};
      font-family: ${p => p.theme.fonts.heading};
      font-size: ${p => p.theme.fontSizes[0]};
      left: 0;
      letter-spacing: ${p => p.theme.letterSpacings.tracked};
      text-transform: uppercase;
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
        links={[
          { label: `Browse Resources`, to: `/docs/awesome-gatsby-resources/` },
        ]}
      />
    </Sections>
    <SubTitle>Some of our recent favorites</SubTitle>
    <FeaturedItems className={SCROLLER_CLASSNAME}>
      <FeaturedItemsList>
        {featuredItems
          .filter(e => Boolean(e))
          .map(item => {
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
