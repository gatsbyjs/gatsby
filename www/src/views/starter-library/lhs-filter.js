/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import MdCheckboxBlank from "react-icons/lib/md/check-box-outline-blank"
import MdCheckbox from "react-icons/lib/md/check-box"

import Collapsible from "../shared/collapsible"
import styles from "../shared/styles"

export default function LHSFilter({
  sortRecent,
  heading,
  data,
  filters,
  setFilters,
  fixed,
}) {
  return (
    <Collapsible heading={heading} fixed={fixed}>
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
          <ul key={c} sx={{ m: 0 }}>
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
              css={styles.filterButton}
            >
              <div
                sx={{
                  color: filters.has(c) ? `gatsby` : `input.border`,
                  ...styles.filterCheckbox,
                }}
              >
                {filters.has(c) ? (
                  <MdCheckbox style={{ verticalAlign: `-0.125em` }} />
                ) : (
                  <MdCheckboxBlank style={{ verticalAlign: `-0.125em` }} />
                )}
              </div>
              <div
                sx={{
                  color: filters.has(c) ? `gatsby` : false,
                  mr: `auto`,
                }}
              >
                {c.replace(/^gatsby-/, `*-`)}
              </div>
              <div sx={styles.filterCount}>{count}</div>
            </button>
          </ul>
        ))}
    </Collapsible>
  )
}

LHSFilter.defaultProps = {
  fixed: false,
}
