import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"

import Button from "../button"
import EcosystemFeaturedItems from "./ecosystem-featured-items"
import EcosystemFeaturedItem from "./ecosystem-featured-item"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const EcosystemSectionRoot = styled(`section`)`
  background: ${p => p.theme.colors.card.background};
  padding: 0 ${p => p.theme.space[6]};
  margin-bottom: ${p => p.theme.space[3]};

  ${mediaQueries.md} {
    box-shadow: ${p => p.theme.shadows.raised};
    border-radius: ${p => p.theme.radii[2]};
    display: flex;
    flex-basis: calc(50% - ${p => p.theme.space[5]});
    flex-direction: column;
    flex-grow: 0;
    margin: 0 ${p => p.theme.space[2]} ${p => p.theme.space[6]};
    max-height: 60vh;
    padding: ${p => p.theme.space[6]};
    padding-bottom: 0;

    :last-child {
      flex-grow: 1;
    }
  }

  ${mediaQueries.lg} {
    flex-basis: calc(33.33% - ${p => p.theme.space[5]});
    max-height: 100%;

    :last-child {
      align-self: flex-start;
      padding-bottom: ${p => p.theme.space[6]};
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
  color: ${p => p.theme.colors.heading};
  display: flex;
  font-size: ${p => p.theme.fontSizes[4]};
  font-weight: ${p => p.theme.fontWeights.heading};
  line-height: ${p => p.theme.lineHeights.solid};
  margin: 0;
  margin-bottom: ${p => p.theme.space[1]};
  min-height: ${p => p.theme.space[7]};

  span {
    margin: 0 ${p => p.theme.space[1]} 0 0;
  }
`

const Icon = styled(`span`)`
  display: block;
  height: ${p => p.theme.space[7]};
  width: ${p => p.theme.space[7]};
`

const SubTitle = styled(`h2`)`
  color: ${p => p.theme.colors.lilac};
  font-size: ${p => p.theme.fontSizes[1]};
  font-weight: normal;
  letter-spacing: ${p => p.theme.letterSpacings.tracked};
  margin: 0;
  margin-top: ${p => p.theme.space[5]};
  text-transform: uppercase;
`

const Description = styled(`p`)`
  color: ${p => p.theme.colors.text};
  font-size: ${p => p.theme.fontSizes[2]};
`

const Actions = styled(`div`)`
  display: flex;
  flex-wrap: wrap;
  margin-top: -${p => p.theme.space[1]};

  > a {
    margin: ${p => p.theme.space[1]} ${p => p.theme.space[2]}
      ${p => p.theme.space[1]} 0;
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
            <Button key={to} to={to} secondary={secondary} variant="small">
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
