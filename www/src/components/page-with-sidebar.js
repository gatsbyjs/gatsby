import React, { Fragment } from "react"

import StickyResponsiveSidebar from "./sidebar/sticky-responsive-sidebar"
import { mediaQueries, sizes } from "../utils/presets"
import { rhythm } from "../utils/typography"

export default props => {
  if (props.disable) {
    return props.renderContent()
  } else {
    return (
      <Fragment>
        <div
          css={{
            [mediaQueries.md]: {
              paddingLeft: rhythm(sizes.sidebarWidth.default),
            },
            [mediaQueries.lg]: {
              paddingLeft: rhythm(sizes.sidebarWidth.large),
            },
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
