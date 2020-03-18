/** @jsx jsx */
import { jsx } from "theme-ui"
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md"

import Collapsible from "../shared/collapsible"
import { filterButton, filterCheckbox } from "../shared/styles"

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
              sx={{
                ...filterButton,
                color: filters.has(c) ? `link.color` : `textMuted`,
              }}
            >
              <div sx={filterCheckbox}>
                {filters.has(c) ? (
                  <MdCheckBox style={{ verticalAlign: `-0.125em` }} />
                ) : (
                  <MdCheckBoxOutlineBlank
                    style={{ verticalAlign: `-0.125em` }}
                  />
                )}
              </div>
              <div sx={{ mr: `auto` }}>{c.replace(/^gatsby-/, `*-`)}</div>
              <div>{count}</div>
            </button>
          </ul>
        ))}
    </Collapsible>
  )
}

LHSFilter.defaultProps = {
  fixed: false,
}
