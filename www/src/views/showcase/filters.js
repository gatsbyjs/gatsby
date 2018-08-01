import React from "react"

import CollapsibleFilterList from "./collapsible-filter-list"
import MdFilterList from "react-icons/lib/md/filter-list"
import MdClear from "react-icons/lib/md/clear"

import { options, scale, rhythm } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"

const Filters = ({
  filters,
  categoryKeys,
  aggregatedCategories,
  updateQuery,
}) => (
  <div css={{ height: `100%` }}>
    <h3
      css={{
        margin: 0,
        [presets.Desktop]: {
          ...scale(1 / 8),
          borderBottom: `1px solid ${colors.ui.light}`,
          color: colors.gray.calm,
          display: `flex`,
          fontWeight: `normal`,
          flexShrink: 0,
          lineHeight: 1,
          height: presets.headerHeight,
          margin: 0,
          paddingLeft: rhythm(3 / 4),
          paddingRight: rhythm(3 / 4),
          paddingTop: rhythm(options.blockMarginBottom),
          paddingBottom: rhythm(options.blockMarginBottom),
        },
      }}
    >
      Filter & Refine{` `}
      <span css={{ marginLeft: `auto`, opacity: 0.5 }}>
        <MdFilterList />
      </span>
    </h3>
    <div
      css={{
        display: `flex`,
        flexDirection: `column`,
        height: `calc(100% - ${presets.headerHeight} + 1px)`,
        paddingLeft: rhythm(3 / 4),
      }}
    >
      {filters.length > 0 && (
        <div
          css={{
            paddingRight: rhythm(3 / 4),
          }}
        >
          <button
            css={{
              ...scale(-1 / 6),
              alignItems: `center`,
              background: colors.ui.light,
              border: 0,
              borderRadius: presets.radius,
              color: colors.gatsby,
              cursor: `pointer`,
              display: `flex`,
              fontFamily: options.headerFontFamily.join(`,`),
              marginTop: rhythm(options.blockMarginBottom),
              paddingRight: rhythm(3 / 4),
              textAlign: `left`,
              "&:hover": {
                background: colors.gatsby,
                color: `#fff`,
              },
            }}
            onClick={() => {
              updateQuery(() => {
                return { filters: [] }
              })
            }}
          >
            <MdClear style={{ marginRight: rhythm(1 / 4) }} /> Reset all Filters
          </button>
        </div>
      )}
      <CollapsibleFilterList
        aggregatedCategories={aggregatedCategories}
        categoryKeys={categoryKeys}
        filters={filters}
        heading="Category"
        updateQuery={updateQuery}
      />
    </div>
  </div>
)

export default Filters
