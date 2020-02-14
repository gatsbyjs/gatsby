/** @jsx jsx */
import { jsx } from "theme-ui"
import { Fragment } from "react"

import { getItemList } from "../utils/sidebar/item-list"
import StickyResponsiveSidebar from "./sidebar/sticky-responsive-sidebar"

export default ({ children, enableScrollSync, location }) => {
  const itemList = getItemList(location.pathname)
  if (!itemList) {
    return children
  }
  return (
    <Fragment>
      <div
        sx={{
          pl: [
            null,
            null,
            null,
            t => t.sizes.sidebarWidth.default,
            t => t.sizes.sidebarWidth.large,
          ],
        }}
      >
        {children}
      </div>
      <StickyResponsiveSidebar
        enableScrollSync={enableScrollSync}
        itemList={itemList.items}
        title={itemList.title}
        sidebarKey={itemList.key}
        disableExpandAll={itemList.disableExpandAll}
        disableAccordions={itemList.disableAccordions}
        key={location.pathname}
        location={location}
      />
    </Fragment>
  )
}
