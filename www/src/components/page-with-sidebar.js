import React, { Fragment } from "react"

import StickyResponsiveSidebar from "./sidebar/sticky-responsive-sidebar"
import presets from "../utils/presets"
import { rhythm } from "../utils/typography"

export default props => {
  if (props.disable) {
    return props.renderContent()
  } else {
    return (
      <Fragment>
        <div
          css={{
            [presets.Md]: {
              paddingLeft: rhythm(presets.sidebar.width.default),
            },
            [`${presets.Md} and (max-width:980px)`]: {
              ".gatsby-highlight": {
                marginLeft: 0,
                marginRight: 0,
              },
            },
            [presets.Lg]: { paddingLeft: rhythm(presets.sidebar.width.large) },
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
