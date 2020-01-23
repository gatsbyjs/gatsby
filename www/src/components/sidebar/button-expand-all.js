/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import GoFold from "react-icons/lib/go/fold"
import GoUnfold from "react-icons/lib/go/unfold"
import useLocalizedStrings from "../use-localized-strings"

const iconStyles = {
  display: `inline-block`,
  mr: 2,
}

export default function ExpandAllButton({ onClick, expandAll }) {
  const { expandLabel, collapseLabel } = useLocalizedStrings(
    "sidebarButtonExpandAll"
  )
  return (
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
          <span>{collapseLabel}</span>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <span sx={iconStyles}>
            <GoUnfold />
          </span>
          <span>{expandLabel}</span>
        </React.Fragment>
      )}
    </button>
  )
}
