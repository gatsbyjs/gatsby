import React, { Fragment } from "react"

import Accordion from "./accordion"
import createLink from "../../utils/sidebar/create-link"

const isItemActive = (activeItemParents, item) => {
  if (activeItemParents) {
    for (let parent of activeItemParents) {
      if (parent === item.title) return true
    }
  }

  return false
}

class Item extends React.PureComponent {
  render() {
    const {
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
    } = this.props

    const isParentOfActiveItem = isItemActive(activeItemParents, item)

    return (
      <Fragment>
        {item.items ? (
          <Accordion
            activeItemLink={activeItemLink}
            activeItemParents={activeItemParents}
            createLink={createLink}
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
          <li>
            {createLink({
              isActive: item.link === activeItemLink.link,
              item,
              location,
              onLinkClick,
              ui,
              level: item.level,
            })}
          </li>
        )}
      </Fragment>
    )
  }
}

export default Item
