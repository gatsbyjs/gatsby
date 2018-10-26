import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"
import { Link } from "gatsby"
import Img from "gatsby-image"

import StarIcon from "react-icons/lib/md/star"
import ArrowDownwardIcon from "react-icons/lib/md/arrow-downward"

import { rhythm, options } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"

const EcosystemFeaturedItemRoot = styled("li")`
  flex-basis: ${props => `calc(100% / ${props.numberOfItems})`};
  float: left;
  margin: 0 2px 0 0;
  padding: 5px;

  ${presets.Tablet} {
    padding: 0;
    border-bottom: 1px solid ${colors.gray.superLight};
  }
`

const BlockLink = styled(Link)`
  border-radius: ${presets.radiusLg}px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  height: 100%;
  padding: ${rhythm(3 / 4)};

  ${presets.Tablet} {
    border-radius: 0;
    box-shadow: none;
    transition: all ${presets.animation.speedDefault}
      ${presets.animation.curveDefault};

    :hover {
      background: ${colors.ui.whisper};
    }
  }
`
const Abstract = styled("div")`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
  height: 100%;
  font-family: ${options.systemFontFamily.join(`,`)};
`

const Thumbnail = styled("div")`
  padding-right: ${rhythm(2 / 3)};
  padding-top: ${rhythm(1 / 12)};

  img {
    height: 64px;
    width: 64px;
  }
`
const Header = styled("header")`
  display: flex;
  justify-content: space-between;
  h3 {
    color: ${colors.gatsbyDark};
    font-size: 1rem;
    margin: 0;
  }

  span {
    color: ${colors.lilac};
    display: flex;
    align-items: center;
    font-size: 0.8125rem;
    font-family: ${options.systemFontFamily.join(`,`)};

    svg {
      fill: ${colors.gray.light};
      height: 1.2em;
      margin-left: 2px;
      width: 1.2em;
    }
  }
`

const Description = styled("p")`
  flex-grow: 1;
  font-size: 0.85rem;
  margin: 0;
  color: ${colors.gray.lightCopy};
  padding: ${rhythm(0.5)} 0 0;
`

const Details = styled("p")`
  color: ${colors.gray.bright};
  display: flex;
  flex-grow: 0;
  font-size: 0.8rem;
  justify-content: space-between;
  padding: ${rhythm(0.3)} 0 0;

  span:first-child {
    background: ${colors.gray.superLight};
    border-radius: ${rhythm(1)};
    color: ${colors.gray.bright};
    padding: 0 5px;

    ::first-letter {
      text-transform: uppercase;
    }
  }
`

const EcosystemFeaturedItem = ({ item, numberOfItems }) => {
  const {
    slug,
    name,
    description,
    lastUpdated,
    stars,
    gatsbyMajorVersion,
    humanDownloadsLast30Days,
    thumbnail,
  } = item

  return (
    <EcosystemFeaturedItemRoot numberOfItems={numberOfItems}>
      <BlockLink to={slug}>
        {thumbnail && (
          <Thumbnail>
            <Img fixed={thumbnail} alt="" />
          </Thumbnail>
        )}
        <Abstract>
          <Header>
            <h3>{name}</h3>
            {humanDownloadsLast30Days && (
              <span>
                {humanDownloadsLast30Days} <ArrowDownwardIcon />
              </span>
            )}
            {stars && (
              <span>
                {stars} <StarIcon />
              </span>
            )}
          </Header>
          <Description>{description}</Description>
          {(gatsbyMajorVersion || lastUpdated) && (
            <Details>
              {gatsbyMajorVersion && (
                <span>{`${gatsbyMajorVersion[0][0]} v${
                  gatsbyMajorVersion[0][1]
                } `}</span>
              )}
              {lastUpdated && <span>Updated {lastUpdated}</span>}
            </Details>
          )}
        </Abstract>
      </BlockLink>
    </EcosystemFeaturedItemRoot>
  )
}

EcosystemFeaturedItem.propTypes = {
  item: PropTypes.object.isRequired,
  numberOfItems: PropTypes.number.isRequired,
}

export default EcosystemFeaturedItem
