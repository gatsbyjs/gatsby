import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"

import Button from "../button"
import EcosystemFeaturedItems from "./ecosystem-featured-items"
import EcosystemFeaturedItem from "./ecosystem-featured-item"

import { rhythm } from "../../utils/typography"
import presets, {
  colors,
  space,
  letterSpacings,
  lineHeights,
  radii,
  shadows,
  breakpoints,
} from "../../utils/presets"

const EcosystemSectionRoot = styled(`section`)`
  background: ${colors.white};
  padding: 0 ${rhythm(space[6])};
  margin-bottom: ${rhythm(space[3])};

  ${breakpoints.md} {
    box-shadow: ${shadows.raised};
    border-radius: ${radii[2]}px;
    display: flex;
    flex-basis: calc(50% - ${rhythm(space[5])});
    flex-direction: column;
    flex-grow: 0;
    margin: 0 ${rhythm(space[2])} ${rhythm(space[6])};
    max-height: 60vh;
    padding: ${rhythm(space[6])};
    padding-bottom: 0;

    :last-child {
      flex-grow: 1;
    }
  }

  ${breakpoints.lg} {
    flex-basis: calc(33.33% - ${rhythm(space[5])});
    max-height: 100%;

    :last-child {
      align-self: flex-start;
      padding-bottom: ${rhythm(space[6])};
    }
  }

  a {
    text-decoration: none;
  }
`

export const Header = styled(`header`)`
  align-items: flex-start;
`

const Title = styled(`h1`)`
  align-items: center;
  color: ${colors.gatsby};
  display: flex;
  font-size: ${presets.scale[4]};
  line-height: ${lineHeights.solid};
  margin: 0;
  margin-bottom: ${rhythm(space[1])};
  min-height: ${rhythm(space[7])};

  span {
    margin: 0 ${rhythm(space[1])} 0 0;
  }
`

const Icon = styled(`span`)`
  display: block;
  height: ${rhythm(space[7])};
  width: ${rhythm(space[7])};
`

const SubTitle = styled(`h2`)`
  color: ${colors.lilac};
  font-size: ${presets.scale[1]};
  font-weight: normal;
  letter-spacing: ${letterSpacings.tracked};
  margin: 0;
  margin-top: ${rhythm(space[5])};
  text-transform: uppercase;
`

const Description = styled(`p`)`
  color: ${colors.gray.lightCopy};
  font-size: ${presets.scale[2]};
`

const Actions = styled(`div`)`
  display: flex;
  flex-wrap: wrap;
  margin-top: -${rhythm(space[1])};

  > a {
    margin: ${rhythm(space[1])} ${rhythm(space[2])} ${rhythm(space[1])} 0;
  }
`

const EcosystemSection = ({
  title,
  description,
  subTitle,
  icon,
  links,
  featuredItems,
  className,
}) => (
  <EcosystemSectionRoot className={className}>
    <Header>
      <Title>
        {icon && <Icon dangerouslySetInnerHTML={{ __html: icon }} />}
        <span>{title}</span>
      </Title>
      <Description>{description}</Description>
      <Actions>
        {links.map(item => {
          const { to, label, secondary } = item

          return (
            <Button key={to} to={to} secondary={secondary} tiny>
              {label}
            </Button>
          )
        })}
      </Actions>
      {subTitle && <SubTitle>{subTitle}</SubTitle>}
    </Header>

    {featuredItems && featuredItems.length > 0 && (
      <EcosystemFeaturedItems
        items={featuredItems}
        itemComponent={EcosystemFeaturedItem}
      />
    )}
  </EcosystemSectionRoot>
)

EcosystemSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  className: PropTypes.string,
  subTitle: PropTypes.string,
  icon: PropTypes.string,
  links: PropTypes.array,
  featuredItems: PropTypes.array,
}

export default EcosystemSection
