import React from "react"

import Item from "./item"
import getActiveItem from "../../utils/sidebar/get-active-item"
import presets, { colors } from "../../utils/presets"
import { options, rhythm, scale } from "../../utils/typography"

const ExpandAllButton = ({ onClick }) => (
  <div
    css={{
      display: `none`,
      marginLeft: rhythm(1),
      marginRight: rhythm(1),
      textAlign: `right`,
      // [presets.Tablet]: {
      //   display: `block`,
      // },
    }}
  >
    <button
      onClick={onClick}
      css={{
        ...scale(-2 / 3),
        background: `transparent`,
        border: `1px solid ${colors.ui.bright}`,
        borderRadius: presets.radius,
        color: colors.gatsby,
        cursor: `pointer`,
        fontFamily: options.systemFontFamily.join(`,`),
      }}
    >
      Expand All
    </button>
  </div>
)

class SidebarBody extends React.Component {
  constructor(props, context) {
    super(props, context)

    let state = {
      openSectionHash: {},
    }

    if (props.sectionList.length === 1) {
      state.openSectionHash[props.sectionList.title] = true
    } else {
      props.sectionList.forEach(child => {
        state.openSectionHash[child.title] =
          props.defaultActiveSection.title === child.title ? true : false
      })
    }

    this.state = state
  }

  _toggleSection(section) {
    const { openSectionHash } = this.state
    this.setState({
      openSectionHash: {
        ...openSectionHash,
        [section.title]: !openSectionHash[section.title],
      },
    })
  }

  _expandAll = () => {
    let openSectionHash = { ...this.state.openSectionHash }
    Object.keys(openSectionHash).forEach(k => (openSectionHash[k] = true))
    this.setState({ openSectionHash })
  }

  render() {
    const {
      createLink,
      location,
      sectionList,
      closeParentMenu,
      enableScrollSync,
      activeItemHash,
    } = this.props
    let { openSectionHash } = this.state
    const singleSection = sectionList.length === 1
    const activeItemLink = getActiveItem(sectionList, location, activeItemHash)

    return (
      <div className="docSearch-sidebar">
        {sectionList.length > 1 && (
          <ExpandAllButton onClick={this._expandAll} />
        )}
        {sectionList.map((item, index) => (
          <Item
            createLink={createLink}
            isActive={openSectionHash[item.title] || singleSection}
            key={index}
            name={item.title}
            location={location}
            onLinkClick={closeParentMenu}
            onSectionTitleClick={() => this._toggleSection(item)}
            item={item}
            hideSectionTitle={singleSection}
            activeItemHash={activeItemHash}
            activeItemLink={activeItemLink}
            isScrollSync={enableScrollSync}
            singleSection={singleSection}
            isFirstItem={index === 0}
            isLastItem={index === sectionList.length - 1}
          />
        ))}
      </div>
    )
  }
}

export default SidebarBody
