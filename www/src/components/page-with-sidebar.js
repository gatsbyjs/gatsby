import React, { Fragment } from "react"

import StickyResponsiveSidebar from "./sidebar/sticky-responsive-sidebar"
import presets, { breakpoints } from "../utils/presets"
import { rhythm } from "../utils/typography"

export default props => {
  if (props.disable) {
    return props.renderContent()
  } else {
    return (
      <Fragment>
        <div
          css={{
            [breakpoints.Md]: {
              paddingLeft: rhythm(presets.sidebar.width.default),
            },
            [breakpoints.Lg]: {
              paddingLeft: rhythm(presets.sidebar.width.large),
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
