import React from "react"

import CollapsibleFilterList from "./collapsible-filter-list"
import { SidebarHeader, SidebarBody, SidebarContainer } from "../shared/sidebar"
import ResetFilters from "../shared/reset-filters"

const Filters = ({
  filters,
  categoryKeys,
  aggregatedCategories,
  setFilters,
}) => (
  <SidebarContainer>
    <SidebarHeader />
    <SidebarBody>
      {filters.length > 0 && <ResetFilters onClick={() => setFilters([])} />}
      <CollapsibleFilterList
        aggregatedCategories={aggregatedCategories}
        categoryKeys={categoryKeys}
        filters={filters}
        heading="Category"
        setFilters={setFilters}
      />
    </SidebarBody>
  </SidebarContainer>
)

export default Filters
