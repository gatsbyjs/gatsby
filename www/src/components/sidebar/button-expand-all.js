import React, { Fragment } from "react"
import GoFold from "react-icons/lib/go/fold"
import GoUnfold from "react-icons/lib/go/unfold"

import presets, { colors, space, radii, transition } from "../../utils/presets"
import { rhythm } from "../../utils/typography"

const ExpandAllButton = ({ onClick, expandAll }) => (
  <button
    onClick={onClick}
    css={{
      fontSize: presets.scale[0],
      lineHeight: presets.lineHeights.solid,
      background: `transparent`,
      border: `none`,
      borderRadius: radii[1],
      color: colors.gatsby,
      display: `flex`,
      cursor: `pointer`,
      alignItems: `center`,
      flexGrow: 0,
      paddingTop: rhythm(space[2]),
      paddingBottom: rhythm(space[2]),
      textAlign: `left`,
      transition: `all ${transition.speed.fast}`,
      "&:hover": {
        background: colors.ui.bright,
      },
    }}
  >
    {expandAll ? (
      <Fragment>
        <span>Collapse All</span>
        <span css={{ ...styles.icon }}>
          <GoFold />
        </span>
      </Fragment>
    ) : (
      <Fragment>
        <span>Expand All</span>
        <span css={{ ...styles.icon }}>
          <GoUnfold />
        </span>
      </Fragment>
    )}
  </button>
)

export default ExpandAllButton

const styles = {
  icon: {
    display: `inline-block`,
    marginLeft: 8,
  },
}
