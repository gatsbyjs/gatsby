import React from "react"

import Item from "./item"
import getActiveItem from "../../utils/sidebar/get-active-item"
import getActiveItemParents from "../../utils/sidebar/get-active-item-parents"

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
      <div className="docSearch-sidebar">
        <ul css={{ margin: 0 }}>
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
