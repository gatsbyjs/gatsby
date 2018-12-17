import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"

import {
  HorizontalScroller,
  HorizontalScrollerContent,
} from "../shared/horizontal-scroller"

import presets, { colors } from "../../utils/presets"
import { rhythm, options } from "../../utils/typography"
import { scrollbarStyles } from "../../utils/styles"
import { SCROLLER_CLASSNAME } from "../../utils/scrollers-observer"

const EcosystemFeaturedItemsRoot = styled(HorizontalScroller)`
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

export const ListBase = styled(`ul`)`
  display: inline-flex;
  list-style: none;
  margin: 0;
  padding: 0 calc(${rhythm(options.blockMarginBottom)} - 5px) 4px;
`

const List = styled(HorizontalScrollerContent)`
  padding-left: ${rhythm(options.blockMarginBottom)};
  padding-right: ${rhythm(options.blockMarginBottom)};

  ${presets.Tablet} {
    flex-direction: column;
    padding: 0;
    width: 100%;
  }
`

const EcosystemFeaturedItems = ({
  items,
  itemComponent: Item,
  className = ``,
}) => (
  <EcosystemFeaturedItemsRoot className={`${SCROLLER_CLASSNAME} ${className}`}>
    <List>
      {items.map(item => {
        const { slug } = item
        return <Item key={slug} item={item} />
      })}
    </List>
  </EcosystemFeaturedItemsRoot>
)

EcosystemFeaturedItems.propTypes = {
  items: PropTypes.array.isRequired,
  itemComponent: PropTypes.func.isRequired,
  className: PropTypes.string,
}

export default EcosystemFeaturedItems
