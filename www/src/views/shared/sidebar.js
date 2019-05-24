import React from "react"
import MdFilterList from "react-icons/lib/md/filter-list"

import {
  colors,
  fontSizes,
  lineHeights,
  space,
  sizes,
  mediaQueries,
} from "../../utils/presets"

const sticky = {
  position: `sticky`,
  top: `calc(${sizes.bannerHeight})`,
  [mediaQueries.lg]: {
    top: `calc(${sizes.headerHeight} + ${sizes.bannerHeight})`,
  },
}

const sidebarContainer = {
  display: `none`,
  [mediaQueries.lg]: {
    display: `block`,
    flexBasis: `15rem`,
    minWidth: `15rem`,
    paddingTop: 0,
    borderRight: `1px solid ${colors.ui.border.subtle}`,
    height: `calc(100vh - (${sizes.headerHeight} + ${sizes.bannerHeight}))`,
  },
}

export const SidebarContainer = ({ children, className }) => (
  <div className={className} css={[sidebarContainer, sticky]}>
    {children}
  </div>
)

export const SidebarBody = ({ children }) => (
  <div
    css={{
      paddingLeft: space[6],
      height: `calc(100vh - ((${sizes.headerHeight}) + ${sizes.bannerHeight}))`,
      display: `flex`,
      flexDirection: `column`,
    }}
  >
    {children}
  </div>
)

export const SidebarHeader = () => (
  <h3
    css={{
      margin: 0,
      [mediaQueries.lg]: {
        fontSize: fontSizes[3],
        display: `none`,
        borderBottom: `1px solid ${colors.purple[10]}`,
        color: colors.text.secondary,
        fontWeight: `normal`,
        flexShrink: 0,
        lineHeight: lineHeights.solid,
        height: sizes.headerHeight,
        margin: 0,
        paddingLeft: space[6],
        paddingRight: space[6],
        paddingTop: space[6],
        paddingBottom: space[6],
      },
    }}
  >
    Filter & Refine
    {` `}
    <span css={{ marginLeft: `auto`, opacity: 0.5 }}>
      <MdFilterList />
    </span>
  </h3>
)

export const ContentContainer = ({ children }) => (
  <div css={{ width: `100%` }}>{children}</div>
)

export const ContentHeader = ({ children, cssOverrides = {} }) => (
  <div
    css={{
      alignItems: `center`,
      background: `rgba(255,255,255,0.98)`,
      borderBottom: `1px solid ${colors.ui.border.subtle}`,
      display: `flex`,
      flexDirection: `row`,
      flexWrap: `wrap`,
      height: sizes.headerHeight,
      justifyContent: `space-between`,
      paddingLeft: space[6],
      paddingRight: space[6],
      zIndex: 1,
      ...sticky,
      ...cssOverrides,
    }}
  >
    {children}
  </div>
)

const ResultCount = ({ children }) => (
  <small
    css={{
      color: colors.text.secondary,
      fontWeight: `normal`,
      fontSize: fontSizes[2],
    }}
  >
    {children}
  </small>
)

export const ContentTitle = ({
  search,
  items,
  filters,
  edges,
  label,
  // todo smooth that out ("Starters" uses "size")
  what = `length`,
}) => (
  <h1
    css={{
      fontSize: fontSizes[4],
      lineHeight: lineHeights.solid,
      margin: 0,
    }}
  >
    {search.length === 0 ? (
      filters[what] === 0 ? (
        // no search or filters
        <span>
          {label}s <ResultCount>({edges.length})</ResultCount>
        </span>
      ) : (
        <span>
          {items.length}
          {` `}
          {filters[what] === 1 && filters.values()[0]}
          {` `}
          {label}
          {items.length > 1 && `s`}
          {` `}
          <ResultCount>(filtered)</ResultCount>
        </span>
      )
    ) : (
      <span>
        {items.length} search result
        {items.length !== 1 && `s`}
      </span>
    )}
  </h1>
)
