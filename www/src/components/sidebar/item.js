import React, { Fragment } from "react"

import Accordion from "./accordion"
import presets from "../../utils/presets"
import { scale, rhythm } from "../../utils/typography"
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
            itemStyles={styles}
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
          <li className="item" css={{ ...styles.item, ...this.props.styles }}>
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

const horizontalPadding = rhythm(3 / 4)
const horizontalPaddingDesktop = rhythm(3 / 2)

const styles = {
  item: {
    lineHeight: 1.3,
    margin: 0,
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    fontSize: scale(-1 / 10).fontSize,
    [presets.Phablet]: {
      fontSize: scale(-2 / 10).fontSize,
    },
    [presets.Tablet]: {
      fontSize: scale(-4 / 10).fontSize,
    },
    [presets.Desktop]: {
      paddingLeft: horizontalPaddingDesktop,
      paddingRight: horizontalPaddingDesktop,
    },
  },
}
