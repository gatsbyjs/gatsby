import React from "react"
// import FaAngleDown from "react-icons/lib/fa/angle-down"
// import FaAngleUp from "react-icons/lib/fa/angle-up"
import MdCheckboxBlank from "react-icons/lib/md/check-box-outline-blank"
import MdCheckbox from "react-icons/lib/md/check-box"
import /*presets, */ { colors } from "../../utils/presets"
import { options, /* rhythm, */ scale, rhythm } from "../../utils/typography"

import Collapsible from '../shared/collapsible'

export default function LHSFilter({ sortRecent, heading, data, filters, setFilters }) {
  return (
    <Collapsible heading={heading}>
      {data
        .sort(([a, anum], [b, bnum]) => {
          if (sortRecent) {
            if (a < b) return -1
            if (a > b) return 1
            return 0
          } else {
            return bnum - anum
          }
        })
        .map(([c, count]) => (
          <ul key={c} css={{ margin: 0 }}>
            <button
              className={filters.has(c) ? `selected` : ``}
              onClick={() => {
                if (filters.has(c)) {
                  filters.delete(c)
                  setFilters(filters)
                } else {
                  setFilters(filters.add(c))
                }
              }}
              css={{
                ...scale(-1 / 6),
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
                  color: filters.has(c)
                    ? colors.gatsby
                    : colors.ui.bright,
                  ...scale(0),
                  marginRight: 8,
                }}
              >
                {filters.has(c) ? <MdCheckbox /> : <MdCheckboxBlank />}
              </div>
              <div
                css={{
                  color: filters.has(c) ? colors.gatsby : false,
                  marginRight: `auto`,
                }}
              >
                {c.replace(/^gatsby-/, `*-`)}
              </div>
              <div css={{ color: colors.gray.calm }}>{count}</div>
            </button>
          </ul>
        ))}
    </Collapsible>
  )
}
