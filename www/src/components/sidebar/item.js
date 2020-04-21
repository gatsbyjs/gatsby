import React, { Fragment, useCallback } from "react"

import Accordion from "./accordion"
import ItemLink from "./item-link"

const isItemActive = (activeItemParents, item) => {
  if (activeItemParents) {
    for (let parent of activeItemParents) {
      if (parent === item.title) return true
    }
  }

  return false
}

const Item = ({
  activeItemLink,
  activeItemParents,
  isActive,
  openSectionHash,
  item,
  location,
  onLinkClick,
  onSectionTitleClick,
  ui,
  isSingle,
  disableAccordions,
}) => {
  const itemRef = useCallback(
    async node => {
      if (item.link === activeItemLink.link && node !== null) {
        // this noop for whatever reason gives time for React to know what
        // ref is attached to the node to scroll to it, removing this line
        // will only scroll to the correct location on a full page refresh,
        // instead of navigating between pages with the prev/next buttons
        // or clicking on linking guides or urls
        await function () {}
        node.scrollIntoView({ block: `center` })
      }
    },
    [location.pathname]
  )

  const isParentOfActiveItem = isItemActive(activeItemParents, item)

  return (
    <Fragment>
      {item.items ? (
        <Accordion
          itemRef={itemRef}
          activeItemLink={activeItemLink}
          activeItemParents={activeItemParents}
          isActive={
            isActive ||
            item.link === location.pathname ||
            isParentOfActiveItem ||
            item.disableAccordions
          }
          isParentOfActiveItem={isParentOfActiveItem}
          item={item}
          location={location}
          onLinkClick={onLinkClick}
          openSectionHash={openSectionHash}
          onSectionTitleClick={onSectionTitleClick}
          isSingle={isSingle}
          disableAccordions={disableAccordions}
        />
      ) : (
        <li ref={itemRef}>
          <ItemLink
            isActive={item.link === activeItemLink.link}
            item={item}
            onLinkClick={onLinkClick}
            ui={ui}
          />
        </li>
      )}
    </Fragment>
  )
}

export default Item
