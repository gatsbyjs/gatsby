import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"

import Button from "../button"
import EcosystemFeaturedItems from "./ecosystem-featured-items"
import EcosystemFeaturedItem from "./ecosystem-featured-item"

import { rhythm, options } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"

const EcosystemSectionRoot = styled(`section`)`
  background: #fff;
  padding: 0 ${rhythm(options.blockMarginBottom)};
  margin-bottom: ${rhythm(1 / 2)};

  ${presets.Tablet} {
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
    border-radius: ${presets.radiusLg}px;
    display: flex;
    flex-basis: calc(50% - 20px);
    flex-direction: column;
    flex-grow: 0;
    margin: 0 10px 20px;
    max-height: 60vh;
    padding: ${rhythm(options.blockMarginBottom)};
    padding-bottom: 0;

    :last-child {
      flex-grow: 1;
    }
  }

  ${presets.Desktop} {
    flex-basis: calc(33.33% - 20px);
    max-height: 100%;

    :last-child {
      align-self: flex-start;
      padding-bottom: ${rhythm(options.blockMarginBottom)};
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
  font-size: 1.25rem;
  line-height: 1;
  margin: 0;
  margin-bottom: ${rhythm(0.25)};
  min-height: 32px;

  span {
    margin: 0 0.3rem 0 -0.1rem;
  }
`

const Icon = styled(`span`)`
  display: block;
  height: 32px;
  width: 32px;
`

const SubTitle = styled(`h2`)`
  color: ${colors.lilac};
  font-size: 0.875rem;
  font-weight: 300;
  letter-spacing: 0.05em;
  margin: 0;
  margin-top: ${rhythm(1)};
  text-transform: uppercase;
`

const Description = styled(`p`)`
  color: ${colors.gray.lightCopy};
  font-family: ${options.systemFontFamily.join(`,`)};
  font-size: 0.8125rem;
`

const Actions = styled(`div`)`
  display: flex;
  flex-wrap: wrap;
  margin-top: -${rhythm(1 / 4)};

  > a {
    margin: 4px 8px 4px 0;
  }
`

const EcosysteSection = ({
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
        {links.map((item, idx) => {
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

    {featuredItems &&
      featuredItems.length > 0 && (
        <EcosystemFeaturedItems
          items={featuredItems}
          itemComponent={EcosystemFeaturedItem}
        />
      )}
  </EcosystemSectionRoot>
)

EcosysteSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  className: PropTypes.string,
  subTitle: PropTypes.string,
  icon: PropTypes.string,
  links: PropTypes.array,
  featuredItems: PropTypes.array,
}

export default EcosysteSection
