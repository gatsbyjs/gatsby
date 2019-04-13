import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"

import {
  HorizontalScroller,
  HorizontalScrollerContent,
} from "../shared/horizontal-scroller"

import { colors, space, breakpoints } from "../../utils/presets"
import { scrollbarStyles } from "../../utils/styles"
import { SCROLLER_CLASSNAME } from "../../utils/scrollers-observer"

const EcosystemFeaturedItemsRoot = styled(HorizontalScroller)`
  margin: 0 -${space[6]};

  ${breakpoints.md} {
    border-top: 1px solid ${colors.gray.superLight};
    margin-top: ${space[3]};
    margin-bottom: 0;
    overflow-y: scroll;
    overflow-x: hidden;
    ${scrollbarStyles};
  }
`

const List = styled(HorizontalScrollerContent)`
  padding-left: ${space[6]};
  padding-right: ${space[6]};

  ${breakpoints.md} {
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
