import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"

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
import presets, { colors } from "../../utils/presets"

import { SCROLLER_CLASSNAME } from "../../utils/scrollers-observer"

const Sections = styled(`div`)`
  display: flex;
  flex-direction: column;

  ${presets.Tablet} {
    flex-direction: row;
    margin: 0 -8px;
  }
`

const Section = styled(EcosystemSection)`
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
  border-radius: ${presets.radiusLg}px;
  margin-bottom: ${rhythm(presets.gutters.default / 2)};
  padding: ${rhythm(options.blockMarginBottom)};

  ${presets.Tablet} {
    margin: 0 8px 0px;
    padding: ${rhythm(options.blockMarginBottom)};

    :last-child {
      align-self: stretch;
    }
  }
`

const SubTitle = styled(`h3`)`
  color: ${colors.lemon};
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
  margin-top: 2rem;

  ${presets.Desktop} {
    margin-left: 3rem;
    margin-bottom: 1rem;
  }
`

const FeaturedItems = styled(HorizontalScroller)`
  margin: 0 -${rhythm(presets.gutters.default / 2)};

  ${presets.Desktop} {
    margin: 0;
    overflow-x: visible;
  }
`

const FeaturedItemsList = styled(HorizontalScrollerContent)`
  ${presets.Desktop} {
    flex-wrap: wrap;
    margin: 0;
    padding: 0;
    width: 100%;
  }
`

const FeaturedItem = styled(EcosystemFeaturedItem)`
  margin-right: ${rhythm(presets.gutters.default / 2)};

  ${presets.Tablet} {
    border-bottom: none;
    margin: ${rhythm(presets.gutters.default / 2)};
    margin-top: 0;
    margin-left: 0;
    width: 320px;
  }

  ${presets.Desktop} {
    flex-basis: 28%;

    :nth-child(4) {
      margin-left: 8%;
    }
  }

  ${FeaturedItemBlockLink} {
    padding-left: calc(${rhythm(3 / 4)} + 1.1rem);
    position: relative;

    /* this ovveride the .main-body a style*/
    box-shadow: none;
    font-weight: normal;

    ${presets.Tablet} {
      border-radius: ${presets.radiusLg}px;
    }

    ${presets.Desktop} {
      :hover {
        background: ${colors.ui.whisper};
      }
    }

    :before {
      background: ${props =>
        props.item.type === `Starter` ? colors.skyLight : colors.accentLight};
      border-radius: ${presets.radiusLg}px 0 0 ${presets.radiusLg}px;
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
      font-size: 0.8rem;
      left: 0;
      letter-spacing: 0.05em;
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
