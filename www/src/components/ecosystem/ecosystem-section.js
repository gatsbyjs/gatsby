import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"
import { Link } from "gatsby"

import Button from "../button"
import EcosystemFeaturedItems from "./ecosystem-featured-items"

import { rhythm, options } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"

const EcosysteSectionRoot = styled("section")`
  background: #fff;
  flex-basis: 33.33%;
  margin-bottom: ${rhythm(0.5)};
  padding: 0 ${rhythm(options.blockMarginBottom)};

  ${presets.Tablet}: {
    border-radius: ${presets.radiusLg};
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    flex-basis: 33.33%;
    margin: 12px;

    :last-child: {
      align-self: flex-start;
    }
  };

  a {
    text-decoration: none;
  }
`
const Header = styled("header")`
  ${presets.Tablet}: {
    padding: ${rhythm(1)};
  };
`

const Title = styled("h1")`
  color: ${colors.gatsby};
  display: flex;
  font-size: 1.25rem;
  margin: 0;
  padding-bottom: ${rhythm(0.5)};

  span {
    margin: 0 0.3rem 0 -0.1rem;
  }
`

const Icon = styled("span")`
  display: block;
  width: 32px;
  height: 32px;
`
const SubTitle = styled("h2")`
  color: ${colors.lilac};
  font-size: 0.875rem;
  font-weight: 300;
  letter-spacing: 0.05em;
  margin: 0;
  text-transform: uppercase;
`

const Description = styled("p")`
  font-family: ${options.systemFontFamily.join(`,`)};
  font-size: 0.8125rem;
  color: ${colors.gray.lightCopy};
`

const Actions = styled("div")`
  display: flex;
  flex-wrap: wrap;
  margin: -4px 0 ${rhythm(1)};

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
  link,
  featuredItems,
}) => (
  <EcosysteSectionRoot>
    <Header>
      {links ? (
        <React.Fragment>
          <Title>
            {icon && <Icon dangerouslySetInnerHTML={{ __html: icon }} />}
            {title}
          </Title>
          <Description>{description}</Description>
          <Actions>
            {links.map((item, idx) => {
              const { to, label, secondary } = item

              return (
                <Button key={to} to={to} secondary={secondary} small>
                  {label}
                </Button>
              )
            })}
          </Actions>
        </React.Fragment>
      ) : (
        <Link to={link}>
          <Title>
            {icon && <Icon dangerouslySetInnerHTML={{ __html: icon }} />}
            {title}
          </Title>
          <Description>{description}</Description>
        </Link>
      )}
      {subTitle && <SubTitle>{subTitle}</SubTitle>}
    </Header>

    {featuredItems &&
      featuredItems.length > 0 && (
        <EcosystemFeaturedItems items={featuredItems} />
      )}
  </EcosysteSectionRoot>
)

EcosysteSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  subTitle: PropTypes.string,
  icon: PropTypes.string,
  links: PropTypes.array,
  link: PropTypes.string,
  featuredItems: PropTypes.array,
}

export default EcosysteSection
