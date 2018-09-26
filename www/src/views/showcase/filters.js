import React from "react"

import CollapsibleFilterList from "./collapsible-filter-list"
import { SidebarHeader, SidebarBody, SidebarContainer } from "../shared/sidebar"
import ResetFilters from "../shared/reset-filters"

const Filters = ({
  filters,
  categoryKeys,
  aggregatedCategories,
  updateQuery,
}) => (
  <SidebarContainer>
    <SidebarHeader />
    <SidebarBody>
      {filters.length > 0 && (
        <ResetFilters
          onClick={() => {
            updateQuery(() => {
              return { filters: [] }
            })
          }}
        />
      )}
      <CollapsibleFilterList
        aggregatedCategories={aggregatedCategories}
        categoryKeys={categoryKeys}
        filters={filters}
        heading="Category"
        updateQuery={updateQuery}
      />
    </SidebarBody>
  </SidebarContainer>
)

export default Filters
