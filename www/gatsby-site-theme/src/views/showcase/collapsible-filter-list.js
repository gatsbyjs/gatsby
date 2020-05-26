/** @jsx jsx */
import { jsx } from "theme-ui"

import { MdCheckBoxOutlineBlank, MdCheckBox } from "react-icons/md"
import Collapsible from "../shared/collapsible"
import { filterButton, filterCheckbox } from "../../views/shared/styles"

const CollapsibleFilterList = ({
  filters,
  categoryKeys,
  aggregatedCategories,
  setFilters,
  heading,
}) => (
  <Collapsible heading={heading}>
    {categoryKeys.map(c => (
      <button
        key={c}
        className={filters.includes(c) ? `selected` : ``}
        onClick={() => {
          if (filters.includes(c)) {
            setFilters(filters.filter(f => f !== c))
          } else {
            setFilters([...filters, c])
          }
        }}
        sx={{
          ...filterButton,
          color: filters.includes(c) ? `link.color` : `textMuted`,
        }}
      >
        <div sx={filterCheckbox}>
          {filters.includes(c) ? (
            <MdCheckBox style={{ verticalAlign: `-0.125em` }} />
          ) : (
            <MdCheckBoxOutlineBlank style={{ verticalAlign: `-0.125em` }} />
          )}
        </div>
        <div sx={{ mr: `auto` }}>{c}</div>
        <div>{aggregatedCategories[c]}</div>
      </button>
    ))}
  </Collapsible>
)

export default CollapsibleFilterList
