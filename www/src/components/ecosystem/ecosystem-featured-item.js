import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"
import { Link } from "gatsby"
import Img from "gatsby-image"

import StarIcon from "react-icons/lib/md/star"
import ArrowDownwardIcon from "react-icons/lib/md/arrow-downward"

import { rhythm, options } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"

const MAX_DESCRIPTION_LENGTH = 100

const EcosystemFeaturedItemRoot = styled(`li`)`
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
  flex-direction: column;
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

const Header = styled(`header`)`
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

const Digest = styled(`div`)`
  display: flex;
  flex-grow: 1;
  justify-content: space-between;
  height: 100%;
  font-family: ${options.systemFontFamily.join(`,`)};
  padding: ${rhythm(0.5)} 0 0;
`

const Thumbnail = styled(`div`)`
  padding-right: ${rhythm(2 / 3)};
  margin-top: ${rhythm(1 / 12)};
  height: 64px;

  img {
    border: 1px solid ${colors.gray.superLight};
  }
`

const Description = styled(`p`)`
  color: ${colors.gray.lightCopy};
  flex-grow: 1;
  font-size: 0.85rem;
  margin: 0;
`

const EcosystemFeaturedItem = ({ item, numberOfItems }) => {
  const {
    slug,
    name,
    description,
    stars,
    humanDownloadsLast30Days,
    thumbnail,
  } = item

  const cutTooLongDescription = str => {
    if (str.length > MAX_DESCRIPTION_LENGTH) {
      return `${str.substring(0, MAX_DESCRIPTION_LENGTH)}...`
    }

    return str
  }

  return (
    <EcosystemFeaturedItemRoot numberOfItems={numberOfItems}>
      <BlockLink to={slug}>
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

        <Digest>
          {thumbnail && (
            <Thumbnail>
              <Img fixed={thumbnail} alt="" />
            </Thumbnail>
          )}
          <Description>{cutTooLongDescription(description)}</Description>
        </Digest>
      </BlockLink>
    </EcosystemFeaturedItemRoot>
  )
}

EcosystemFeaturedItem.propTypes = {
  item: PropTypes.object.isRequired,
  numberOfItems: PropTypes.number.isRequired,
}

export default EcosystemFeaturedItem
