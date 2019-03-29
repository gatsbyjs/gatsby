import React from "react"
import MdFilterList from "react-icons/lib/md/filter-list"
import styles from "../shared/styles"

export const SidebarContainer = ({ children, className }) => (
  <div className={className} css={[styles.sidebarContainer, styles.sticky]}>
    {children}
  </div>
)

export const SidebarBody = ({ children }) => (
  <div css={styles.sidebarBody}>{children}</div>
)

export const SidebarHeader = () => (
  <h3 css={styles.sidebarHeader}>
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
  <div css={{ ...styles.contentHeader, ...styles.sticky, ...cssOverrides }}>
    {children}
  </div>
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
  <h2 css={styles.contentTitle}>
    {search.length === 0 ? (
      filters[what] === 0 ? (
        // no search or filters
        <span>
          {label}s <small css={styles.resultCount}>({edges.length})</small>
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
          <small css={styles.resultCount}>(filtered)</small>
        </span>
      )
    ) : (
      <span>
        {items.length} search result
        {items.length !== 1 && `s`}
      </span>
    )}
  </h2>
)
