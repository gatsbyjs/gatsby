import React, { Fragment } from "react"
import GoFold from "react-icons/lib/go/fold"
import GoUnfold from "react-icons/lib/go/unfold"

import presets, { colors } from "../../utils/presets"
import { scale, options, rhythm } from "../../utils/typography"

const ExpandAllButton = ({ onClick, expandAll }) => (
  <button
    onClick={onClick}
    css={{
      ...scale(-2 / 3),
      lineHeight: 1,
      background: `transparent`,
      border: `none`,
      borderRadius: presets.radius,
      color: colors.gatsby,
      display: `flex`,
      cursor: `pointer`,
      alignItems: `center`,
      flexGrow: 0,
      marginLeft: `auto`,
      paddingTop: rhythm(options.blockMarginBottom / 3),
      paddingBottom: rhythm(options.blockMarginBottom / 3),
      fontFamily: options.systemFontFamily.join(`,`),
      textAlign: `left`,
      transition: `all .2s`,
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
    fontSize: `.9rem`,
    marginLeft: 8,
  },
}
