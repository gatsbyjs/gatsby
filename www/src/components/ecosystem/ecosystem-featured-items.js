import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"

import EcosystemFeaturedItem from "./ecosystem-featured-item"

import presets, { colors } from "../../utils/presets"
import { rhythm, options } from "../../utils/typography"
import { scrollbarStyles } from "../../utils/styles"

const EcosystemFeaturedItemsRoot = styled(`div`)`
  overflow-x: scroll;
  margin: ${rhythm(0.1)} -${rhythm(options.blockMarginBottom)};

  ${presets.Tablet} {
    border-top: 1px solid ${colors.gray.superLight};
    margin-top: ${rhythm(0.4)};
    margin-bottom: 0;
    overflow-y: scroll;
    overflow-x: hidden;
    ${scrollbarStyles};
  }
`

const List = styled(`ul`)`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0 calc(${rhythm(options.blockMarginBottom)} - 5px) 4px;
  width: ${props => `calc(80vw * ${props.numberOfItems})`};

  ${presets.Tablet} {
    flex-direction: column;
    padding: 0;
    width: 100%;
  }
`

const EcosystemFeaturedItems = ({ items }) => (
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

EcosystemFeaturedItems.propTypes = {
  items: PropTypes.array,
}

export default EcosystemFeaturedItems
