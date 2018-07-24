import React from "react"

import Item from "./item"
import getActiveItem from "../../utils/sidebar/get-active-item"
import getActiveItemParents from "../../utils/sidebar/get-active-item-parents"

import presets, { colors } from "../../utils/presets"
import { scale, options } from "../../utils/typography"

class SidebarBody extends React.Component {
  render() {
    const {
      location,
      sectionList,
      closeParentMenu,
      enableScrollSync,
      activeItemHash,
    } = this.props
    const singleSection = sectionList.length === 1
    const activeItemLink = getActiveItem(sectionList, location, activeItemHash)
    const activeItemParents = getActiveItemParents(
      sectionList,
      activeItemLink,
      []
    )

    return (
      <div className="docSearch-sidebar" css={{ height: `100%` }}>
        <ul
          css={{
            margin: 0,
            backgroundColor: colors.ui.whisper,
            borderRight: `1px solid ${colors.ui.border}`,
            paddingTop: 20,
            paddingBottom: 20,
            fontSize: scale(-1 / 10).fontSize,
            [presets.Phablet]: {
              fontSize: scale(-2 / 10).fontSize,
            },
            [presets.Tablet]: {
              fontSize: scale(-4 / 10).fontSize,
            },
            "& a": {
              fontFamily: options.systemFontFamily.join(`,`),
            },
            "& li": {
              margin: 0,
              // "&:hover": {
              //   background: `linear-gradient( #663399FF 0, ${
              //     colors.lilac
              //   }00 1px, ${colors.lilac}00 100% )`,
              // },
            },
            "& > li:last-child > span:before": {
              display: `none`,
            },
          }}
        >
          {sectionList.map((item, index) => (
            <Item
              activeItemHash={activeItemHash}
              activeItemLink={activeItemLink}
              activeItemParents={activeItemParents}
              hideSectionTitle={singleSection}
              isFirstItem={index === 0}
              isLastItem={index === sectionList.length - 1}
              isScrollSync={enableScrollSync}
              item={item}
              key={index}
              level={0}
              location={location}
              onLinkClick={closeParentMenu}
              onSectionTitleClick={() => this._toggleSection(item)}
              singleSection={singleSection}
            />
          ))}
        </ul>
      </div>
    )
  }
}

export default SidebarBody
