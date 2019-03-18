import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"
import { Link } from "gatsby"
import Img from "gatsby-image"

import { HorizontalScrollerItem } from "../shared/horizontal-scroller"

import StarIcon from "react-icons/lib/md/star"
import ArrowDownwardIcon from "react-icons/lib/md/arrow-downward"

import { rhythm, options } from "../../utils/typography"
import presets, {
  colors,
  space,
  transition,
  radii,
  shadows,
  breakpoints,
} from "../../utils/presets"

const MAX_DESCRIPTION_LENGTH = 100

const EcosystemFeaturedItemRoot = styled(HorizontalScrollerItem)`
  margin-right: ${rhythm(space[6])};

  ${breakpoints.md} {
    border-bottom: 1px solid ${colors.gray.superLight};
    box-shadow: none;
    margin: 0;
    padding: 0;
    width: auto;
  }
`

export const BlockLink = styled(Link)`
  background: ${colors.white};
  border-radius: ${radii[2]}px;
  box-shadow: ${shadows.raised};
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${rhythm(space[6])};

  ${breakpoints.md} {
    border-radius: 0;
    box-shadow: none;
    transition: all ${transition.speed.default} ${transition.curve.default};
  }

  ${breakpoints.lg} {
    :hover {
      background: ${colors.ui.whisper};
    }
  }
`

const Header = styled(`header`)`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;

  h3 {
    color: ${colors.gatsbyDark};
    font-size: ${presets.scale[2]};
    margin: 0;
  }

  span {
    align-items: center;
    color: ${colors.lilac};
    display: flex;
    font-size: ${presets.scale[1]};
    padding-left: ${rhythm(space[3])};

    svg {
      fill: ${colors.gray.light};
      height: auto;
      margin-left: ${rhythm(space[1])};
      width: ${rhythm(space[4])};
    }
  }
`

const Digest = styled(`div`)`
  display: flex;
  flex-grow: 1;
  font-family: ${options.systemFontFamily.join(`,`)};
  justify-content: space-between;
  padding: ${rhythm(space[3])} 0 0;
`

const Thumbnail = styled(`div`)`
  height: ${rhythm(space[11])};
  padding-right: ${rhythm(space[4])};
  margin-top: ${rhythm(space[1])};

  img {
    border: 1px solid ${colors.gray.superLight};
  }
`

const Description = styled(`p`)`
  color: ${colors.gray.lightCopy};
  flex-grow: 1;
  font-size: ${presets.scale[1]};
  margin: 0;
`

const EcosystemFeaturedItem = ({ item, className }) => {
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
    <EcosystemFeaturedItemRoot className={className}>
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
  className: PropTypes.string,
}

export default EcosystemFeaturedItem
