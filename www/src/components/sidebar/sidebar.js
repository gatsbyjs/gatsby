/** @jsx jsx */
import { jsx } from "theme-ui"
import React, { Component } from "react"
import { t } from "@lingui/macro"
import { withI18n } from "@lingui/react"

import Item from "./item"
import ExpandAllButton from "./button-expand-all"
import getActiveItem from "../../utils/sidebar/get-active-item"
import getActiveItemParents from "../../utils/sidebar/get-active-item-parents"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

// Access to global `localStorage` property must be guarded as it
// fails under iOS private session mode.
var hasLocalStorage = true
var testKey = `gatsbyjs.sidebar.testKey`
var ls
try {
  ls = global.localStorage
  ls.setItem(testKey, `test`)
  ls.removeItem(testKey)
} catch (e) {
  hasLocalStorage = false
}

const isItemActive = (activeItemParents, item) => {
  if (activeItemParents) {
    for (let parent of activeItemParents) {
      if (parent === item.title) return true
    }
  }

  return false
}

const getOpenItemHash = (itemList, state) => {
  for (let item of itemList) {
    if (item.items) {
      state.openSectionHash[item.title] =
        isItemActive(state.activeItemParents, item) ||
        state.activeItemLink.title === item.title

      getOpenItemHash(item.items, state)
    }
  }

  return false
}

function _getOpenItemHash(itemList, activeItemLink, activeItemParents) {
  let result = {}
  for (let item of itemList) {
    if (item.items) {
      result[item.title] =
        isItemActive(activeItemParents, item) ||
        activeItemLink.title === item.title
      result = {
        ...result,
        ..._getOpenItemHash(item.items, activeItemLink, activeItemParents),
      }
    }
  }
  return result
}

function readLocalStorage(key) {
  if (hasLocalStorage) {
    return JSON.parse(localStorage.getItem(`gatsbyjs:sidebar:${key}`))
  }
  return {}
}

function writeLocalStorage(key, state) {
  if (hasLocalStorage) {
    localStorage.setItem(`gatsbyjs:sidebar:${key}`, JSON.stringify(state))
  }
}

function Sidebar({
  i18n,
  title,
  sidebarKey,
  closeSidebar,
  itemList,
  location,
  position,
  activeItemHash,
  disableExpandAll,
  disableAccordions,
}) {
  // TODO initialize state
  const isSingle = itemList.filter(item => item.level === 0).length === 1
  const scrollRef = React.useRef(null)

  // Set the scroll position if one is provided
  React.useEffect(() => {
    if (scrollRef.current && position) {
      scrollRef.current.scrollTop = position
    }
  }, [position])

  const activeItemLink = getActiveItem(itemList, location, activeItemHash)
  const activeItemParents = getActiveItemParents(
    itemList,
    activeItemLink,
    []
  ).map(link => link.title)

  // Get the hash where the only open items are
  // the hierarchy defined in props
  const derivedHash = React.useMemo(() => {
    return _getOpenItemHash(itemList, activeItemLink, activeItemParents)
  }, [itemList, activeItemLink, activeItemParents])

  // Merge hash in local storage and the derived hash from props
  const initialHash = React.useMemo(() => {
    const { openSectionHash } = readLocalStorage(sidebarKey)
    for (const [key, isOpen] of Object.entries(derivedHash)) {
      if (isOpen) {
        openSectionHash[key] = true
      }
    }
    return openSectionHash
  }, [derivedHash])

  const [openSectionHash, setOpenSectionHash] = React.useState(initialHash)
  const [expandAll, setExpandAll] = React.useState(false)

  // Write to local storage whenever the open section hash changes
  React.useEffect(() => {
    writeLocalStorage(sidebarKey, { openSectionHash })
  }, [openSectionHash])

  // Update the expandAll variable when the hash changes
  React.useEffect(() => {
    setExpandAll(Object.values(openSectionHash).every(isOpen => isOpen))
  }, [openSectionHash])

  function toggleSection(item) {
    const newOpenSectionHash = {
      ...openSectionHash,
      [item.title]: !openSectionHash[item.title],
    }

    setOpenSectionHash(newOpenSectionHash)
  }

  function toggleExpandAll() {
    if (expandAll) {
      setOpenSectionHash(derivedHash)
      setExpandAll(false)
    } else {
      const newOpenSectionHash = {}
      for (const key of Object.keys(openSectionHash)) {
        newOpenSectionHash[key] = true
      }
      setOpenSectionHash(newOpenSectionHash)
      setExpandAll(false)
    }
  }

  return (
    <section
      aria-label={i18n._(t`Secondary Navigation`)}
      id="SecondaryNavigation"
      className="docSearch-sidebar"
      sx={{ height: `100%` }}
    >
      {!disableExpandAll && (
        <header
          sx={{
            alignItems: `center`,
            bg: `background`,
            borderColor: `ui.border`,
            borderRightStyle: `solid`,
            borderRightWidth: `1px`,
            display: `flex`,
            height: `sidebarUtilityHeight`,
            pl: 4,
            pr: 6,
          }}
        >
          <ExpandAllButton onClick={toggleExpandAll} expandAll={expandAll} />
        </header>
      )}
      <nav
        ref={scrollRef}
        sx={{
          WebkitOverflowScrolling: `touch`,
          bg: `background`,
          border: 0,
          display: `block`,
          overflowY: `auto`,
          transition: t =>
            `opacity ${t.transition.speed.default} ${t.transition.curve.default}`,
          zIndex: 10,
          borderRightWidth: `1px`,
          borderRightStyle: `solid`,
          borderColor: `ui.border`,
          height: t =>
            disableExpandAll
              ? `100%`
              : `calc(100% - ${t.sizes.sidebarUtilityHeight})`,
          [mediaQueries.md]: {
            top: t => `calc(${t.sizes.headerHeight} + ${t.sizes.bannerHeight})`,
          },
        }}
      >
        <h3
          sx={{
            color: `textMuted`,
            px: 6,
            fontSize: 1,
            pt: 6,
            margin: 0,
            fontWeight: `body`,
            textTransform: `uppercase`,
            letterSpacing: `tracked`,
          }}
        >
          {title}
        </h3>
        <ul
          sx={{
            m: 0,
            py: 4,
            fontSize: 1,
            bg: `background`,
            "& li": {
              m: 0,
              listStyle: `none`,
            },
            "& > li:last-child > span:before": {
              display: `none`,
            },
          }}
        >
          {itemList.map((item, index) => (
            <Item
              activeItemLink={activeItemLink}
              activeItemParents={activeItemParents}
              isActive={item.link === location.pathname}
              isExpanded={openSectionHash[item.title]}
              item={item}
              key={index}
              location={location}
              onLinkClick={closeSidebar}
              onSectionTitleClick={toggleSection}
              openSectionHash={openSectionHash}
              isSingle={isSingle}
              disableAccordions={disableAccordions}
            />
          ))}
        </ul>
      </nav>
    </section>
  )
}

class SidebarBody extends Component {
  constructor(props, context) {
    super(props, context)

    this._toggleSection = this._toggleSection.bind(this)
    this.state = { ...this._getInitialState(props) }
    this.scrollRef = React.createRef()
  }

  componentDidMount() {
    const node = this.scrollRef.current

    if (hasLocalStorage) {
      const key = this.props.sidebarKey
      const initialState = this.state
      const localState = this._readLocalStorage(key)

      if (localState) {
        const bar = Object.keys(initialState.openSectionHash).filter(function(
          key
        ) {
          return initialState.openSectionHash[key]
        })

        const state = {
          ...initialState,
          openSectionHash: JSON.parse(localState).openSectionHash,
        }

        for (let item in initialState.openSectionHash) {
          for (let parent of bar) {
            if (parent === item) {
              state.openSectionHash[item] = true
            }
          }
        }

        state.expandAll = Object.entries(state.openSectionHash).every(k => k[1])
        this.setState(state, () => {
          if (node && this.props.position) {
            node.scrollTop = this.props.position
          }
        })
      } else {
        this._writeLocalStorage(this.state, key)
      }
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.activeItemHash !== state.activeItemHash) {
      const activeItemLink = getActiveItem(
        props.itemList,
        props.location,
        props.activeItemHash
      )

      return {
        activeItemLink: activeItemLink,
        activeItemParents: getActiveItemParents(
          props.itemList,
          activeItemLink,
          []
        ).map(link => link.title),
        activeItemHash: props.activeItemHash,
      }
    }

    return null
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
      key: props.sidebarKey,
      activeItemHash: props.activeItemHash,
      activeItemLink: activeItemLink,
      activeItemParents: getActiveItemParents(
        props.itemList,
        activeItemLink,
        []
      ).map(link => link.title),
    }

    getOpenItemHash(props.itemList, state)
    state.expandAll = Object.entries(state.openSectionHash).every(k => k[1])

    return state
  }

  _readLocalStorage(key) {
    if (hasLocalStorage) {
      return localStorage.getItem(`gatsbyjs:sidebar:${key}`)
    } else {
      return false
    }
  }

  _writeLocalStorage(state, key) {
    if (hasLocalStorage) {
      localStorage.setItem(`gatsbyjs:sidebar:${key}`, JSON.stringify(state))
    }
  }

  _toggleSection(item) {
    const { openSectionHash } = this.state

    const state = {
      openSectionHash: {
        ...openSectionHash,
        [item.title]: !openSectionHash[item.title],
      },
    }

    state.expandAll = Object.entries(state.openSectionHash).every(k => k[1])

    this._writeLocalStorage(state, this.state.key)
    this.setState(state)
  }

  _expandAll = () => {
    if (this.state.expandAll) {
      this._writeLocalStorage(
        { openSectionHash: this._getInitialState(this.props).openSectionHash },
        this.state.key
      )
      this.setState({
        ...this._getInitialState(this.props),
        expandAll: false,
      })
    } else {
      let openSectionHash = { ...this.state.openSectionHash }
      Object.keys(openSectionHash).forEach(k => (openSectionHash[k] = true))
      this._writeLocalStorage({ openSectionHash }, this.state.key)
      this.setState({ openSectionHash, expandAll: true })
    }
  }

  render() {
    const { i18n, closeSidebar, itemList, location } = this.props
    const { openSectionHash, activeItemLink, activeItemParents } = this.state

    const isSingle = itemList.filter(item => item.level === 0).length === 1

    return (
      <section
        aria-label={i18n._(t`Secondary Navigation`)}
        id="SecondaryNavigation"
        className="docSearch-sidebar"
        sx={{ height: `100%` }}
      >
        {!this.props.disableExpandAll && (
          <header
            sx={{
              alignItems: `center`,
              bg: `background`,
              borderColor: `ui.border`,
              borderRightStyle: `solid`,
              borderRightWidth: `1px`,
              display: `flex`,
              height: `sidebarUtilityHeight`,
              pl: 4,
              pr: 6,
            }}
          >
            <ExpandAllButton
              onClick={this._expandAll}
              expandAll={this.state.expandAll}
            />
          </header>
        )}
        <nav
          ref={this.scrollRef}
          sx={{
            WebkitOverflowScrolling: `touch`,
            bg: `background`,
            border: 0,
            display: `block`,
            overflowY: `auto`,
            transition: t =>
              `opacity ${t.transition.speed.default} ${t.transition.curve.default}`,
            zIndex: 10,
            borderRightWidth: `1px`,
            borderRightStyle: `solid`,
            borderColor: `ui.border`,
            height: t =>
              this.props.disableExpandAll
                ? `100%`
                : `calc(100% - ${t.sizes.sidebarUtilityHeight})`,
            [mediaQueries.md]: {
              top: t =>
                `calc(${t.sizes.headerHeight} + ${t.sizes.bannerHeight})`,
            },
          }}
        >
          <h3
            sx={{
              color: `textMuted`,
              px: 6,
              fontSize: 1,
              pt: 6,
              margin: 0,
              fontWeight: `body`,
              textTransform: `uppercase`,
              letterSpacing: `tracked`,
            }}
          >
            {this.props.title}
          </h3>
          <ul
            sx={{
              m: 0,
              py: 4,
              fontSize: 1,
              bg: `background`,
              "& li": {
                m: 0,
                listStyle: `none`,
              },
              "& > li:last-child > span:before": {
                display: `none`,
              },
            }}
          >
            {itemList.map((item, index) => (
              <Item
                activeItemLink={activeItemLink}
                activeItemParents={activeItemParents}
                isActive={item.link === location.pathname}
                isExpanded={openSectionHash[item.title]}
                item={item}
                key={index}
                location={location}
                onLinkClick={closeSidebar}
                onSectionTitleClick={this._toggleSection}
                openSectionHash={openSectionHash}
                isSingle={isSingle}
                disableAccordions={this.props.disableAccordions}
              />
            ))}
          </ul>
        </nav>
      </section>
    )
  }
}

export default withI18n()(Sidebar)
