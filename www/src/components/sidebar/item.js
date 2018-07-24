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
      location,
      onLinkClick,
      onSectionTitleClick,
      item,
      hideSectionTitle,
      singleSection,
      activeItemLink,
      isFirstItem,
      isLastItem,
      level,
      activeItemParents,
      ui,
    } = this.props

    return (
      <Fragment>
        {item.items ? (
          <Accordion
            isActive={
              item.link === location.pathname ||
              isItemActive(activeItemParents, item) ||
              item.disableAccordions
            }
            onSectionTitleClick={onSectionTitleClick}
            hideSectionTitle={hideSectionTitle}
            singleSection={singleSection}
            item={item}
            activeItemLink={activeItemLink}
            createLink={createLink}
            location={location}
            isFirstItem={isFirstItem}
            isLastItem={isLastItem}
            level={level}
            activeItemParents={activeItemParents}
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
