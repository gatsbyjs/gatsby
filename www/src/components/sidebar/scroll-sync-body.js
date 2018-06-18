import React, { Component } from "react"
import Body from "./body"

class ScrollSyncSection extends Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      activeItemId: ``,
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
    const { sectionList } = this.props

    const itemIds = _getItemIds(sectionList)
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
      if (nextItemTopOffset) {
        return (
          window.scrollY >= itemTopOffset.offsetTop &&
          window.scrollY < nextItemTopOffset.offsetTop
        )
      }
      return window.scrollY >= itemTopOffset.offsetTop
    })

    this.setState({
      activeItemId: item ? item.id : ``,
    })
  }

  render() {
    const { activeItemId } = this.state
    return (
      <div css={{ background: `transparent` }}>
        <Body isScrollSync activeItemId={activeItemId} {...this.props} />
      </div>
    )
  }
}

const _getItemIds = sectionList => {
  let list = []

  sectionList.map(section => {
    let foo = section.items
      .map(item => {
        let subItemIds = []
        if (item.subitems) {
          subItemIds = item.subitems.map(subitem => subitem.id)
        }
        return [item.id, ...subItemIds]
      })
      .reduce((prev, current) => prev.concat(current))

    list.push(foo)
  })

  return [].concat(...list)
}

const _getElementTopOffsetsById = ids =>
  ids
    .map(id => {
      const element = document.getElementById(id)
      if (!element) {
        return null
      }
      return {
        id,
        offsetTop: element.offsetTop - 63,
      }
    })
    .filter(item => item)

export default ScrollSyncSection
