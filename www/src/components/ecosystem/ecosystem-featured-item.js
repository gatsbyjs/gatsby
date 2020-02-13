import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"
import { Link } from "gatsby"
import Img from "gatsby-image"
import StarIcon from "react-icons/lib/md/star"
import ArrowDownwardIcon from "react-icons/lib/md/arrow-downward"

import { HorizontalScrollerItem } from "../shared/horizontal-scroller"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const MAX_DESCRIPTION_LENGTH = 100

const EcosystemFeaturedItemRoot = styled(HorizontalScrollerItem)`
  margin-right: ${p => p.theme.space[6]};

  ${mediaQueries.md} {
    border-bottom: 1px solid ${p => p.theme.colors.ui.border};
    box-shadow: none;
    margin: 0;
    padding: 0;
    width: auto;
  }
`

export const BlockLink = styled(Link)`
  background: ${p => p.theme.colors.card.background};
  border-radius: ${p => p.theme.radii[2]};
  box-shadow: ${p => p.theme.shadows.raised};
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${p => p.theme.space[6]};

  ${mediaQueries.md} {
    border-radius: 0;
    box-shadow: none;
    transition: all ${p => p.theme.transition.speed.default}
      ${p => p.theme.transition.curve.default};
  }

  ${mediaQueries.lg} {
    :hover {
      background: ${p => p.theme.colors.ui.hover};
    }
  }
`

const Header = styled(`header`)`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;

  h3 {
    color: ${p => p.theme.colors.heading};
    font-size: ${p => p.theme.fontSizes[2]};
    margin: 0;
  }

  span {
    align-items: center;
    color: ${p => p.theme.colors.textMuted};
    display: flex;
    font-size: ${p => p.theme.fontSizes[1]};
    padding-left: ${p => p.theme.space[3]};

    svg {
      fill: ${p => p.theme.colors.textMuted};
      height: auto;
      margin-left: ${p => p.theme.space[1]};
      width: ${p => p.theme.space[4]};
    }
  }
`

const Digest = styled(`div`)`
  display: flex;
  flex-grow: 1;
  font-family: ${p => p.theme.fonts.system};
  justify-content: space-between;
  padding: ${p => p.theme.space[3]} 0 0;
`

const Thumbnail = styled(`div`)`
  height: ${p => p.theme.space[11]};
  padding-right: ${p => p.theme.space[4]};
  margin-top: ${p => p.theme.space[1]};

  img {
    border: 1px solid ${p => p.theme.colors.ui.border};
  }
`

const Description = styled(`p`)`
  color: ${p => p.theme.colors.textMuted};
  flex-grow: 1;
  font-size: ${p => p.theme.fontSizes[1]};
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
