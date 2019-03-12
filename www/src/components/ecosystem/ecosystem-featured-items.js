import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"

import {
  HorizontalScroller,
  HorizontalScrollerContent,
} from "../shared/horizontal-scroller"

import presets, { colors, space } from "../../utils/presets"
import { rhythm } from "../../utils/typography"
import { scrollbarStyles } from "../../utils/styles"
import { SCROLLER_CLASSNAME } from "../../utils/scrollers-observer"

const EcosystemFeaturedItemsRoot = styled(HorizontalScroller)`
  margin: 0 -${rhythm(space[6])};

  ${presets.Md} {
    border-top: 1px solid ${colors.gray.superLight};
    margin-top: ${rhythm(space[3])};
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
  padding: 0 calc(${rhythm(space[6])} - 5px) 4px;
`

const List = styled(HorizontalScrollerContent)`
  padding-left: ${rhythm(space[6])};
  padding-right: ${rhythm(space[6])};

  ${presets.Md} {
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
