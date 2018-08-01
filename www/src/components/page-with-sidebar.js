import React from "react"

import Sidebar from "./sidebar/sidebar"
import presets from "../utils/presets"
import { rhythm } from "../utils/typography"
import findSectionForPath from "../utils/sidebar/find-section-for-path"

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
        <Sidebar
          location={props.location}
          sectionList={props.sectionList}
          createLink={props.createLink}
          defaultActiveSection={findSectionForPath(
            props.location.pathname,
            props.sectionList
          )}
          enableScrollSync={props.enableScrollSync}
          key={props.location.pathname}
        />
      </div>
    )
  }
}
