import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"
import { Link } from "gatsby"

import StarIcon from "react-icons/lib/md/star"
import ArrowDownIcon from "react-icons/lib/md/arrow-downward"

import { rhythm, options } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"

console.log(presets)

const EcosystemFeaturedItemRoot = styled("li")`
  flex-basis: ${props => `calc(100% / ${props.numberOfItems})`};
  float: left;
  margin: 0 2px 0 0;
  padding: 5px;
`

const BlockLink = styled(Link)`
  border-radius: ${presets.radiusLg}px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
  display: block;
  height: 100%;
  padding: ${rhythm(3 / 4)};
`
const Abstract = styled("div")`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  font-family: ${options.systemFontFamily.join(`,`)};
`

const Thumbnail = styled("img")`
  height: 64px;
  width: 64px;
`
const Header = styled("header")`
  display: flex;
  flex-grow: 0;
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
  padding: ${rhythm(0.1)} 0 0;

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
    image,
  } = item

  return (
    <EcosystemFeaturedItemRoot numberOfItems={numberOfItems}>
      <BlockLink to={slug}>
        {image && <Thumbnail src="" alt="" />}
        <Abstract>
          <Header>
            <h3>{name}</h3>
            {humanDownloadsLast30Days && (
              <span>
                {humanDownloadsLast30Days} <StarIcon />
              </span>
            )}
            {stars && (
              <span>
                {stars}
                <ArrowDownIcon />
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
              {lastUpdated && <span>{lastUpdated}</span>}
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
