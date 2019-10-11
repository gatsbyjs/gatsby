/** @jsx jsx */
import { jsx } from "theme-ui"
import { Fragment } from "react"

import StickyResponsiveSidebar from "./sidebar/sticky-responsive-sidebar"

export default props => {
  if (props.disable) {
    return props.renderContent()
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
          {props.renderContent()}
        </div>
        <StickyResponsiveSidebar
          enableScrollSync={props.enableScrollSync}
          itemList={props.itemList.items}
          title={props.itemList.title}
          sidebarKey={props.itemList.key}
          disableExpandAll={props.itemList.disableExpandAll}
          disableAccordions={props.itemList.disableAccordions}
          key={props.location.pathname}
          location={props.location}
        />
      </Fragment>
    )
  }
}
