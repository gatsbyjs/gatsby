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

class Item extends React.Component {
  render() {
    const {
      activeItemLink,
      activeItemParents,
      item,
      level,
      location,
      onLinkClick,
      onSectionTitleClick,
      ui,
    } = this.props

    return (
      <Fragment>
        {item.items ? (
          <Accordion
            activeItemLink={activeItemLink}
            activeItemParents={activeItemParents}
            createLink={createLink}
            isActive={
              item.link === location.pathname ||
              isItemActive(activeItemParents, item) ||
              item.disableAccordions
            }
            item={item}
            level={level}
            location={location}
            onLinkClick={onLinkClick}
            onSectionTitleClick={onSectionTitleClick}
          />
        ) : (
          <li
            className="item"
            css={{
              ...this.props.styles,
              paddingLeft: level === 0 ? 40 : false,
            }}
          >
            {createLink({
              isActive: item.link === activeItemLink.link,
              item,
              location,
              onLinkClick,
              stepsUI: ui === `steps`,
            })}
          </li>
        )}
      </Fragment>
    )
  }
}

export default Item
