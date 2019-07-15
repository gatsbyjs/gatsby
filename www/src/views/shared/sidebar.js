/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import MdFilterList from "react-icons/lib/md/filter-list"

import {
  colors,
  fontSizes,
  lineHeights,
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
    borderColor: `ui.border.subtle`,
    borderRightStyle: `solid`,
    borderRightWidth: `1px`,
    display: `block`,
    flexBasis: `15rem`,
    height: `calc(100vh - (${sizes.headerHeight} + ${sizes.bannerHeight}))`,
    minWidth: `15rem`,
    paddingTop: 0,
  },
}

export const SidebarContainer = ({ children, className }) => (
  <div className={className} css={[sidebarContainer, sticky]}>
    {children}
  </div>
)

export const SidebarBody = ({ children }) => (
  <div
    sx={{
      display: `flex`,
      flexDirection: `column`,
      height: `calc(100vh - ((${sizes.headerHeight}) + ${sizes.bannerHeight}))`,
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
    css={{
      color: colors.text.secondary,
      fontSize: fontSizes[2],
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
