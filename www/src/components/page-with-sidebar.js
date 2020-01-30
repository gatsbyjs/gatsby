/** @jsx jsx */
import { jsx } from "theme-ui"
import { Fragment } from "react"
import { useItemList } from "../utils/sidebar/item-list"

import StickyResponsiveSidebar from "./sidebar/sticky-responsive-sidebar"

export default ({ location, enableScrollSync, renderContent }) => {
  const itemList = useItemList(location.pathname)
  if (!itemList) {
    return renderContent()
  } else {
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
          {renderContent()}
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
}
