/** @jsx jsx */
import { jsx } from "theme-ui"
import { MdFilterList } from "react-icons/md"

import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

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
        borderColor: `ui.border`,
        borderRightStyle: `solid`,
        borderRightWidth: `1px`,
        display: `block`,
        flexBasis: t => t.sizes.showcaseSidebarMaxWidth,
        height: t =>
          `calc(100vh - (${t.sizes.headerHeight} + ${t.sizes.bannerHeight}))`,
        minWidth: `showcaseSidebarMaxWidth`,
        pt: 0,
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
        borderColor: `ui.border`,
        color: `textMuted`,
        display: `none`,
        flexShrink: 0,
        fontSize: 3,
        fontWeight: `body`,
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
      borderColor: `ui.border`,
      display: `flex`,
      flexDirection: `row`,
      flexWrap: `wrap`,
      height: `headerHeight`,
      justifyContent: `space-between`,
      px: 6,
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
      color: `textMuted`,
      fontSize: 2,
      fontWeight: `body`,
    }}
  >
    {children}
  </small>
)

export const ContentTitle = ({
  search,
  items,
  filters,
  nodes,
  label,
  // TODO smooth that out ("Starters" uses "size")
  what = `length`,
}) => (
  <h1
    sx={{
      fontSize: 4,
      lineHeight: `solid`,
      margin: 0,
      fontWeight: `bold`,
    }}
  >
    {search.length === 0 ? (
      filters[what] === 0 ? (
        // no search or filters
        <span>
          {label}s <ResultCount>({nodes.length})</ResultCount>
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
