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

function getOpenItemHash(itemList, activeItemLink, activeItemParents) {
  let result = {}
  for (let item of itemList) {
    if (item.items) {
      result[item.title] =
        isItemActive(activeItemParents, item) ||
        activeItemLink.title === item.title
      result = {
        ...result,
        ...getOpenItemHash(item.items, activeItemLink, activeItemParents),
      }
    }
  }
  return result
}

function readLocalStorage(key) {
  if (hasLocalStorage) {
    return JSON.parse(localStorage.getItem(`gatsbyjs:sidebar:${key}`)) ?? {}
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
  const derivedHash = getOpenItemHash(
    itemList,
    activeItemLink,
    activeItemParents
  )

  // Merge hash in local storage and the derived hash from props
  const initialHash = (() => {
    const { openSectionHash = {} } = readLocalStorage(sidebarKey)
    for (const [key, isOpen] of Object.entries(derivedHash)) {
      if (isOpen) {
        openSectionHash[key] = true
      }
    }
    return openSectionHash
  })()

  const [openSectionHash, setOpenSectionHash] = React.useState(initialHash)
  const expandAll = Object.values(openSectionHash).every(isOpen => isOpen)

  function toggleSection(item) {
    setOpenSectionHash(openSectionHash => {
      return {
        ...openSectionHash,
        [item.title]: !openSectionHash[item.title],
      }
    })
  }

  function toggleExpandAll() {
    if (expandAll) {
      setOpenSectionHash(derivedHash)
    } else {
      const newOpenSectionHash = {}
      for (const key of Object.keys(derivedHash)) {
        newOpenSectionHash[key] = true
      }
      setOpenSectionHash(newOpenSectionHash)
    }
  }

  // Write to local storage whenever the open section hash changes
  React.useEffect(() => {
    writeLocalStorage(sidebarKey, { openSectionHash })
  }, [openSectionHash])

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

export default withI18n()(Sidebar)
