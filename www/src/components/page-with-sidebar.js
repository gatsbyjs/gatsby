/** @jsx jsx */
import { jsx } from "theme-ui"
import { Fragment } from "react"

import StickyResponsiveSidebar from "./sidebar/sticky-responsive-sidebar"
import { mediaQueries } from "../gatsby-plugin-theme-ui"

export default props => {
  if (props.disable) {
    return props.renderContent()
  } else {
    return (
      <Fragment>
        <div
          sx={{
            [mediaQueries.md]: { pl: t => t.sizes.sidebarWidth.default },
            [mediaQueries.lg]: { pl: t => t.sizes.sidebarWidth.large },
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
