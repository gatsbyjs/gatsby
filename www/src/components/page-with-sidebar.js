import React from "react"

import SidebarBody from "./sidebar-body"
import presets from "../utils/presets"
import { rhythm } from "../utils/typography"

export default props => {
  if (props.disable) {
    return props.renderContent()
  } else {
    return (
      <div>
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
        <SidebarBody yaml={props.yaml} />
      </div>
    )
  }
}
