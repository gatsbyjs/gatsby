import React from "react"

import MdCheckboxBlank from "react-icons/lib/md/check-box-outline-blank"
import MdCheckbox from "react-icons/lib/md/check-box"
import Collapsible from "./collabsible"

import { options, scale, rhythm } from "../../utils/typography"
import { colors } from "../../utils/presets"

const CollapsibleFilterList = ({
  filters,
  categoryKeys,
  aggregatedCategories,
  updateQuery,
  heading,
}) => (
  <Collapsible heading={heading}>
    {categoryKeys.map(c => (
      <button
        key={c}
        className={filters.includes(c) ? `selected` : ``}
        onClick={() => {
          if (filters.includes(c)) {
            updateQuery(() => {
              return { filters: filters.filter(f => f !== c) }
            })
          } else {
            updateQuery(() => {
              return { filters: [...filters, c] }
            })
          }
        }}
        css={{
          ...scale(-1 / 6),
          margin: 0,
          alignItems: `flex-start`,
          background: `none`,
          border: `none`,
          color: colors.gray.text,
          cursor: `pointer`,
          display: `flex`,
          fontFamily: options.headerFontFamily.join(`,`),
          justifyContent: `space-between`,
          outline: `none`,
          padding: 0,
          paddingRight: rhythm(1),
          paddingBottom: rhythm(options.blockMarginBottom / 8),
          paddingTop: rhythm(options.blockMarginBottom / 8),
          width: `100%`,
          textAlign: `left`,
          ":hover": {
            color: colors.gatsby,
          },
        }}
      >
        <div
          css={{
            color: filters.includes(c) ? colors.gatsby : colors.ui.bright,
            ...scale(0),
            marginRight: 8,
          }}
        >
          {filters.includes(c) ? <MdCheckbox /> : <MdCheckboxBlank />}
        </div>
        <div
          css={{
            color: filters.includes(c) ? colors.gatsby : false,
            marginRight: `auto`,
          }}
        >
          {c}
        </div>
        <div css={{ color: colors.gray.calm }}>{aggregatedCategories[c]}</div>
      </button>
    ))}
  </Collapsible>
)

export default CollapsibleFilterList
