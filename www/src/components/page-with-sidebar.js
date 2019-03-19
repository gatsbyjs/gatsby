import React, { Fragment } from "react"

import StickyResponsiveSidebar from "./sidebar/sticky-responsive-sidebar"
import { breakpoints, dimensions } from "../utils/presets"
import { rhythm } from "../utils/typography"

export default props => {
  if (props.disable) {
    return props.renderContent()
  } else {
    return (
      <Fragment>
        <div
          css={{
            [breakpoints.md]: {
              paddingLeft: rhythm(dimensions.sidebarWidth.default),
            },
            [breakpoints.lg]: {
              paddingLeft: rhythm(dimensions.sidebarWidth.large),
            },
          }}
        >
          {props.renderContent()}
        </div>
        <StickyResponsiveSidebar
          enableScrollSync={props.enableScrollSync}
          itemList={props.itemList}
          key={props.location.pathname}
          location={props.location}
        />
      </Fragment>
    )
  }
}
