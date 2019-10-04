import React, { Fragment } from "react"
import GoFold from "react-icons/lib/go/fold"
import GoUnfold from "react-icons/lib/go/unfold"

import {
  colors,
  space,
  radii,
  transition,
  fontSizes,
  lineHeights,
} from "../../utils/presets"

const ExpandAllButton = ({ onClick, expandAll }) => (
  <button
    onClick={onClick}
    css={{
      fontSize: fontSizes[0],
      lineHeight: lineHeights.solid,
      background: `transparent`,
      border: `none`,
      borderRadius: radii[1],
      color: colors.text.secondary,
      display: `flex`,
      cursor: `pointer`,
      alignItems: `center`,
      flexGrow: 0,
      paddingTop: space[2],
      paddingBottom: space[2],
      textAlign: `left`,
      transition: `all ${transition.speed.fast}`,
      "&:hover": {
        background: colors.purple[10],
        color: colors.gatsby,
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
