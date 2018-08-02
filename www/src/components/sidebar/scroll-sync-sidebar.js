import React, { Component } from "react"

import SidebarBody from "./sidebar"

class ScrollSyncSection extends Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      activeItemHash: `NONE`,
      itemTopOffsets: [],
    }

    this.calculateItemTopOffsets = this.calculateItemTopOffsets.bind(this)
    this.handleResize = this.handleResize.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
  }

  componentDidMount() {
    this.calculateItemTopOffsets()

    window.addEventListener(`resize`, this.handleResize)
    window.addEventListener(`scroll`, this.handleScroll)
  }

  componentWillUnmount() {
    window.removeEventListener(`resize`, this.handleResize)
    window.removeEventListener(`scroll`, this.handleScroll)
  }

  calculateItemTopOffsets() {
    const { itemList } = this.props

    const itemIds = _getItemIds(itemList)
    this.setState({
      itemTopOffsets: _getElementTopOffsetsById(itemIds),
    })
  }

  handleResize() {
    this.calculateItemTopOffsets()
    this.handleScroll()
  }

  handleScroll() {
    const { itemTopOffsets } = this.state
    const item = itemTopOffsets.find((itemTopOffset, i) => {
      const nextItemTopOffset = itemTopOffsets[i + 1]

      return nextItemTopOffset
        ? window.scrollY >= itemTopOffset.offsetTop &&
            window.scrollY < nextItemTopOffset.offsetTop
        : window.scrollY >= itemTopOffset.offsetTop
    })

    this.setState({
      activeItemHash: item ? item.hash : `NONE`,
    })
  }

  render() {
    const { activeItemHash } = this.state
    return (
      <SidebarBody
        isScrollSync
        activeItemHash={activeItemHash}
        {...this.props}
      />
    )
  }
}

// @todo make recursive
const _getItemIds = itemList => {
  let list = []

  itemList.forEach(section => {
    if (section.items) {
      let sectionItems = section.items
        .map(item => {
          let subItemIds = []
          if (item.items) {
            subItemIds = item.items.map(subitem => subitem.hash)
          }
          return [item.hash, ...subItemIds]
        })
        .reduce((prev, current) => prev.concat(current))

      list.push(sectionItems)
    }
  })

  return [].concat(...list)
}

const _getElementTopOffsetsById = ids => {
  const banner = document.getElementsByClassName(`banner`)
  const navigation = document.getElementsByClassName(`navigation`)
  const bannerHeight = banner[0].offsetHeight || 0
  const navigationHeight = navigation[0].offsetHeight || 0

  return ids
    .map(hash => {
      const element = document.getElementById(hash)
      return element
        ? {
            hash,
            offsetTop: element.offsetTop - bannerHeight - navigationHeight,
          }
        : null
    })
    .filter(item => item)
}

export default ScrollSyncSection
