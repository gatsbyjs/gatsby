import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"

import Button from "../button"
import EcosystemFeaturedItems from "./ecosystem-featured-items"
import EcosystemFeaturedItem from "./ecosystem-featured-item"

import { mediaQueries } from "../../gatsby-plugin-theme-ui"

const EcosystemSectionRoot = styled(`section`)`
  background: ${props => props.theme.colors.white};
  padding: 0 ${props => props.theme.space[6]};
  margin-bottom: ${props => props.theme.space[3]};

  ${mediaQueries.md} {
    box-shadow: ${props => props.theme.shadows.raised};
    border-radius: ${props => props.theme.radii[2]}px;
    display: flex;
    flex-basis: calc(50% - ${props => props.theme.space[5]});
    flex-direction: column;
    flex-grow: 0;
    margin: 0 ${props => props.theme.space[2]} ${props => props.theme.space[6]};
    max-height: 60vh;
    padding: ${props => props.theme.space[6]};
    padding-bottom: 0;

    :last-child {
      flex-grow: 1;
    }
  }

  ${mediaQueries.lg} {
    flex-basis: calc(33.33% - ${props => props.theme.space[5]});
    max-height: 100%;

    :last-child {
      align-self: flex-start;
      padding-bottom: ${props => props.theme.space[6]};
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
  color: ${props => props.theme.colors.gatsby};
  display: flex;
  font-size: ${props => props.theme.fontSizes[4]};
  font-weight: ${props => props.theme.fontWeights[1]};
  line-height: ${props => props.theme.lineHeights.solid};
  margin: 0;
  margin-bottom: ${props => props.theme.space[1]};
  min-height: ${props => props.theme.space[7]};

  span {
    margin: 0 ${props => props.theme.space[1]} 0 0;
  }
`

const Icon = styled(`span`)`
  display: block;
  height: ${props => props.theme.space[7]};
  width: ${props => props.theme.space[7]};
`

const SubTitle = styled(`h2`)`
  color: ${props => props.theme.colors.lilac};
  font-size: ${props => props.theme.fontSizes[1]};
  font-weight: normal;
  letter-spacing: ${props => props.theme.letterSpacings.tracked};
  margin: 0;
  margin-top: ${props => props.theme.space[5]};
  text-transform: uppercase;
`

const Description = styled(`p`)`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.fontSizes[2]};
`

const Actions = styled(`div`)`
  display: flex;
  flex-wrap: wrap;
  margin-top: -${props => props.theme.space[1]};

  > a {
    margin: ${props => props.theme.space[1]} ${props => props.theme.space[2]}
      ${props => props.theme.space[1]} 0;
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
