import React, { Component } from "react"

import Item from "./item"
import getActiveItem from "../../utils/sidebar/get-active-item"
import getActiveItemParents from "../../utils/sidebar/get-active-item-parents"
import presets, { colors } from "../../utils/presets"
import { scale, options } from "../../utils/typography"

const isItemActive = (activeItemParents, item) => {
  if (activeItemParents) {
    for (let parent of activeItemParents) {
      if (parent === item.title) return true
    }
  }

  return false
}

const ExpandAllButton = ({ onClick, expandAll }) => (
  <div
    css={{
      position: `fixed`,
      top: 240,
      left: 0,
      textAlign: `right`,
      zIndex: 10,
    }}
  >
    <button
      onClick={onClick}
      css={{
        transform: `rotate(-90deg)`,
        transformOrigin: `top left`,
        ...scale(-2 / 3),
        background: colors.ui.bright,
        border: `none`,
        borderBottomLeftRadius: presets.radius,
        borderBottomRightRadius: presets.radius,
        color: colors.gatsby,
        cursor: `pointer`,
        paddingLeft: 10,
        paddingRight: 10,
        fontFamily: options.systemFontFamily.join(`,`),
      }}
    >
      {expandAll ? `Collapse All` : `Expand All`}
    </button>
  </div>
)

const getOpenItemHash = (itemList, state) => {
  for (let item of itemList) {
    // console.log(`--`, item.title)

    state.openSectionHash[item.title] =
      isItemActive(state.activeItemParents, item) ||
      state.activeItemLink.title === item.title

    if (item.items) {
      getOpenItemHash(item.items, state)
    }
  }

  return false
}

class SidebarBody extends Component {
  constructor(props, context) {
    super(props, context)

    this._toggleSection = this._toggleSection.bind(this)

    this.state = { ...this._getInitialState(props) }
  }

  _getInitialState(props) {
    const activeItemLink = getActiveItem(
      props.itemList,
      props.location,
      props.activeItemHash
    )

    const state = {
      openSectionHash: {},
      expandAll: false,
      activeItemLink: activeItemLink,
      activeItemParents: getActiveItemParents(
        props.itemList,
        activeItemLink,
        []
      ),
    }

    getOpenItemHash(props.itemList, state)

    return state
  }

  _toggleSection(item) {
    console.log(`=== TOGGLE SECTION`, item)

    const { openSectionHash } = this.state
    this.setState({
      openSectionHash: {
        ...openSectionHash,
        [item.title]: !openSectionHash[item.title],
      },
    })
  }

  _expandAll = () => {
    if (this.state.expandAll) {
      this.setState({
        ...this._getInitialState(this.props),
        expandAll: false,
      })
      // console.log(`EXPANDED ALL`, this.state)
    } else {
      let openSectionHash = { ...this.state.openSectionHash }
      Object.keys(openSectionHash).forEach(k => (openSectionHash[k] = true))
      this.setState({ openSectionHash, expandAll: true })
      // console.log(`EXPANDED ALL`, this.state)
    }
  }

  render() {
    const {
      activeItemHash,
      closeSidebar,
      enableScrollSync,
      itemList,
      location,
    } = this.props
    const { openSectionHash, activeItemLink, activeItemParents } = this.state

    console.log(`open sections:`, this.state)

    return (
      <div className="docSearch-sidebar" css={{ height: `100%` }}>
        <ExpandAllButton
          onClick={this._expandAll}
          expandAll={this.state.expandAll}
        />
        <ul css={{ ...styles.list }}>
          {itemList.map((item, index) => (
            <Item
              activeItemHash={activeItemHash}
              activeItemLink={activeItemLink}
              activeItemParents={activeItemParents}
              isActive={openSectionHash[item.title]}
              isScrollSync={enableScrollSync}
              item={item}
              key={index}
              level={0}
              location={location}
              onLinkClick={closeSidebar}
              onSectionTitleClick={this._toggleSection}
              sectionHash={openSectionHash}
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
