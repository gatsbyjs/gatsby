import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"
import { Link } from "gatsby"

import EcosystemFeaturedItem from "./ecosystem-featured-item"

import presets, { colors } from "../../utils/presets"
import { rhythm, options } from "../../utils/typography"

const EcosystemFeaturedItemsContainer = styled("div")`
  overflow-x: scroll;
  margin: 0 -${rhythm(options.blockMarginBottom)};
`

const List = styled("ul")`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0 calc(${rhythm(options.blockMarginBottom)} - 5px) 4px;
  width: ${props => `calc(280px * ${props.numberOfItems})`};
`

const EcosystemFeaturedItems = ({ items }) => {
  return (
    <EcosystemFeaturedItemsContainer>
      <List numberOfItems={items.length}>
        {items.map(item => {
          const { slug } = item
          return (
            <EcosystemFeaturedItem
              key={slug}
              item={item}
              numberOfItems={items.length}
            />
          )
        })}
      </List>
    </EcosystemFeaturedItemsContainer>
  )
}

EcosystemFeaturedItems.propTypes = {
  items: PropTypes.array,
}

export default EcosystemFeaturedItems
