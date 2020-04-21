/** @jsx jsx */
import { jsx } from "theme-ui"
import { Trans } from "@lingui/macro"
import React from "react"
import { GoFold, GoUnfold } from "react-icons/go"

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
        bg: `sidebar.itemHoverBackground`,
        color: `navigation.linkHover`,
      },
    }}
  >
    {expandAll ? (
      <React.Fragment>
        <span sx={iconStyles}>
          <GoFold />
        </span>
        <span>
          <Trans>Collapse All</Trans>
        </span>
      </React.Fragment>
    ) : (
      <React.Fragment>
        <span sx={iconStyles}>
          <GoUnfold />
        </span>
        <span>
          <Trans>Expand All</Trans>
        </span>
      </React.Fragment>
    )}
  </button>
)

export default ExpandAllButton
