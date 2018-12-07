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
    return <SidebarBody activeItemHash={activeItemHash} {...this.props} />
  }
}

const _getItemIds = section => {
  let list = []

  section.forEach(subSection => {
    if (subSection.hasOwnProperty(`hash`)) list.push(subSection.hash)
    if (subSection.items) list.push(..._getItemIds(subSection.items))
  })

  return list
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
