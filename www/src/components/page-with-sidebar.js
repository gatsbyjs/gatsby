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
            [presets.Tablet]: { paddingLeft: rhythm(10) },
            [`${presets.Tablet} and (max-width:980px)`]: {
              ".gatsby-highlight": {
                marginLeft: 0,
                marginRight: 0,
              },
            },
            [presets.Desktop]: { paddingLeft: rhythm(12) },
          }}
        >
          {props.renderContent()}
        </div>
        <StickyResponsiveSidebar
          location={props.location}
          sectionList={props.sectionList}
          enableScrollSync={props.enableScrollSync}
          key={props.location.pathname}
        />
      </Fragment>
    )
  }
}
