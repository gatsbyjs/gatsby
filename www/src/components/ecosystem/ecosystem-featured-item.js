import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"
import { Link } from "gatsby"

import { rhythm, options } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"

console.log(presets)

const EcosystemFeaturedItemContainer = styled("li")`
  flex-basis: ${props => `calc(100% / ${props.numberOfItems})`};
  float: left;
  margin: 0 2px 0 0;
  padding: 5px;
`

const BlockLink = styled(Link)`
  border-radius: ${presets.radiusLg}px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
  display: block;
  padding: ${rhythm(3 / 4)};
  height: 100%;
`

const Thumbnail = styled("img")`
  width: 64px;
  height: 64px;
`
const Header = styled("header")`
  h3 {
    color: ${colors.gatsbyDark};
    font-size: 1rem;
    margin: 0;
  }
`

const Description = styled("p")`
  font-family: ${options.systemFontFamily.join(`,`)};
  font-size: 0.8125rem;
  margin-top: 12px;
  color: ${colors.gray.lightCopy};
`

const Abstract = styled("div")``

const EcosystemFeaturedItem = ({ item, numberOfItems }) => {
  const {
    slug,
    name,
    description,
    lastUpdated,
    starts,
    gatsbyMajorVersion,
    downloadsLast30Days,
    image,
  } = item

  return (
    <EcosystemFeaturedItemContainer numberOfItems={numberOfItems}>
      <BlockLink to={slug}>
        {image && <Thumbnail src="" alt="" />}
        <Abstract>
          <Header>
            <h3>{name}</h3>
          </Header>
          <Description>{description}</Description>
        </Abstract>
      </BlockLink>
    </EcosystemFeaturedItemContainer>
  )
}

EcosystemFeaturedItem.propTypes = {
  item: PropTypes.object.isRequired,
  numberOfItems: PropTypes.number.isRequired,
}

export default EcosystemFeaturedItem
