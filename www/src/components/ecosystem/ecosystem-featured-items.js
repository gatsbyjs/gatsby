import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"
import { Link } from "gatsby"

import EcosystemFeaturedItem from "./ecosystem-featured-item"

import presets, { colors } from "../../utils/presets"
import { rhythm, options } from "../../utils/typography"

const EcosystemFeaturedItemsRoot = styled("div")`
  overflow-x: scroll;
  margin: ${rhythm(0.1)} -${rhythm(options.blockMarginBottom)};
`

const List = styled("ul")`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0 calc(${rhythm(options.blockMarginBottom)} - 5px) 4px;
  width: ${props => `calc(85vw * ${props.numberOfItems})`};

  ${presets.Tablet} {
    width: 100%;
    flex-direction: column;
  }
`

const EcosystemFeaturedItems = ({ items }) => {
  return (
    <EcosystemFeaturedItemsRoot>
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
    </EcosystemFeaturedItemsRoot>
  )
}

EcosystemFeaturedItems.propTypes = {
  items: PropTypes.array,
}

export default EcosystemFeaturedItems
