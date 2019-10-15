/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import GoFold from "react-icons/lib/go/fold"
import GoUnfold from "react-icons/lib/go/unfold"

const iconStyles = {
  display: `inline-block`,
  mr: 2,
}

const ExpandAllButton = ({ onClick, expandAll }) => (
  <button
    onClick={onClick}
    sx={{
      alignItems: `center`,
      bg: `transparent`,
      border: `none`,
      borderRadius: 1,
      color: `textMuted`,
      cursor: `pointer`,
      display: `flex`,
      flexGrow: 0,
      fontSize: 0,
      lineHeight: `solid`,
      py: 2,
      textAlign: `left`,
      transition: t => `all ${t.transition.speed.fast}`,
      "&:hover": {
        bg: `purple.10`,
        color: `gatsby`,
      },
    }}
  >
    {expandAll ? (
      <React.Fragment>
        <span sx={iconStyles}>
          <GoFold />
        </span>
        <span>Collapse All</span>
      </React.Fragment>
    ) : (
      <React.Fragment>
        <span sx={iconStyles}>
          <GoUnfold />
        </span>
        <span>Expand All</span>
      </React.Fragment>
    )}
  </button>
)

export default ExpandAllButton
