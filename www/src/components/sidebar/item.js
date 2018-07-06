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
      section,
      hideSectionTitle,
      singleSection,
      activeItemLink,
      isFirstItem,
      isLastItem,
    } = this.props

    return (
      <Fragment>
        {section.items ? (
          <Accordion
            itemStyles={styles}
            isActive={this.props.isActive || section.disableAccordions}
            onSectionTitleClick={onSectionTitleClick}
            hideSectionTitle={hideSectionTitle}
            singleSection={singleSection}
            section={section}
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
              isActive: section.link === activeItemLink,
              item: section,
              section,
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
