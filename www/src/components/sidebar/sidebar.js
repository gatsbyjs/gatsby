import React from "react"

import Item from "./item"
import getActiveItem from "../../utils/sidebar/get-active-item"
import getActiveItemParents from "../../utils/sidebar/get-active-item-parents"
import presets, { colors } from "../../utils/presets"
import { scale, options } from "../../utils/typography"

class SidebarBody extends React.Component {
  render() {
    const {
      activeItemHash,
      closeSidebar,
      enableScrollSync,
      itemList,
      location,
    } = this.props
    const activeItemLink = getActiveItem(itemList, location, activeItemHash)
    const activeItemParents = getActiveItemParents(itemList, activeItemLink, [])

    return (
      <div className="docSearch-sidebar" css={{ height: `100%` }}>
        <ul css={{ ...styles.list }}>
          {itemList.map((item, index) => (
            <Item
              activeItemHash={activeItemHash}
              activeItemLink={activeItemLink}
              activeItemParents={activeItemParents}
              isScrollSync={enableScrollSync}
              item={item}
              key={index}
              level={0}
              location={location}
              onLinkClick={closeSidebar}
            />
          ))}
        </ul>
      </div>
    )
  }
}

export default SidebarBody

const styles = {
  list: {
    margin: 0,
    paddingTop: 20,
    paddingBottom: 20,
    fontSize: scale(-1 / 10).fontSize,
    [presets.Phablet]: {
      fontSize: scale(-2 / 10).fontSize,
    },
    [presets.Tablet]: {
      backgroundColor: colors.ui.whisper,
      borderRight: `1px solid ${colors.ui.border}`,
      fontSize: scale(-4 / 10).fontSize,
    },
    "&&": {
      "& a": {
        fontFamily: options.systemFontFamily.join(`,`),
      },
    },
    "& li": {
      margin: 0,
      listStyle: `none`,
    },
    "& > li:last-child > span:before": {
      display: `none`,
    },
  },
}
