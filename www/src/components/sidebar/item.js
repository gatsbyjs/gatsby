import React, { Fragment } from "react"

import Accordion from "./accordion"
import presets from "../../utils/presets"
import { scale, rhythm } from "../../utils/typography"

class Item extends React.Component {
  render() {
    const {
      createLink,
      location,
      onLinkClick,
      onSectionTitleClick,
      item,
      hideSectionTitle,
      singleSection,
      activeItemLink,
      isFirstItem,
      isLastItem,
    } = this.props

    return (
      <Fragment>
        {item.items ? (
          <Accordion
            itemStyles={styles}
            isActive={this.props.isActive || item.disableAccordions}
            onSectionTitleClick={onSectionTitleClick}
            hideSectionTitle={hideSectionTitle}
            singleSection={singleSection}
            item={item}
            activeItemLink={activeItemLink}
            createLink={createLink}
            location={location}
            isFirstItem={isFirstItem}
            isLastItem={isLastItem}
          />
        ) : (
          <div
            className="item"
            css={{
              ...styles.item,
            }}
          >
            {createLink({
              isActive: item.link === activeItemLink,
              item: item,
              item,
              location,
              onLinkClick,
            })}
          </div>
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
