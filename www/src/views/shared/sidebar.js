/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import MdFilterList from "react-icons/lib/md/filter-list"

import { mediaQueries } from "../../gatsby-plugin-theme-ui"

const sticky = t => {
  return {
    position: `sticky`,
    top: `calc(${t.sizes.bannerHeight})`,
    [mediaQueries.lg]: {
      top: `calc(${t.sizes.headerHeight} + ${t.sizes.bannerHeight})`,
    },
  }
}

export const SidebarContainer = ({ children, className }) => (
  <div
    className={className}
    sx={{
      display: `none`,
      [mediaQueries.lg]: {
        borderColor: `ui.border.subtle`,
        borderRightStyle: `solid`,
        borderRightWidth: `1px`,
        display: `block`,
        flexBasis: `15rem`,
        height: t =>
          `calc(100vh - (${t.sizes.headerHeight} + ${t.sizes.bannerHeight}))`,
        minWidth: `15rem`,
        paddingTop: 0,
      },
    }}
    css={sticky}
  >
    {children}
  </div>
)

export const SidebarBody = ({ children }) => (
  <div
    sx={{
      display: `flex`,
      flexDirection: `column`,
      height: t =>
        `calc(100vh - ((${t.sizes.headerHeight}) + ${t.sizes.bannerHeight}))`,
      paddingLeft: 6,
    }}
  >
    {children}
  </div>
)

export const SidebarHeader = () => (
  <h3
    sx={{
      margin: 0,
      [mediaQueries.lg]: {
        borderBottomStyle: `solid`,
        borderBottomWidth: `1px`,
        borderColor: `ui.border.subtle`,
        color: `text.secondary`,
        display: `none`,
        flexShrink: 0,
        fontSize: 3,
        fontWeight: `normal`,
        height: `headerHeight`,
        lineHeight: `solid`,
        margin: 0,
        paddingBottom: 6,
        paddingLeft: 6,
        paddingRight: 6,
        paddingTop: 6,
      },
    }}
  >
    Filter & Refine
    {` `}
    <span sx={{ ml: `auto`, opacity: 0.5 }}>
      <MdFilterList />
    </span>
  </h3>
)

export const ContentContainer = ({ children }) => (
  <div sx={{ width: `100%` }}>{children}</div>
)

export const ContentHeader = ({ children, cssOverrides = {} }) => (
  <div
    sx={{
      alignItems: `center`,
      backgroundColor: `navigation.background`,
      borderBottomStyle: `solid`,
      borderBottomWidth: `1px`,
      borderColor: `ui.border.subtle`,
      display: `flex`,
      flexDirection: `row`,
      flexWrap: `wrap`,
      height: `headerHeight`,
      justifyContent: `space-between`,
      paddingLeft: 6,
      paddingRight: 6,
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
    sx={{
      color: `text.secondary`,
      fontSize: 2,
      fontWeight: `normal`,
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
    sx={{
      fontSize: 4,
      lineHeight: `solid`,
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
