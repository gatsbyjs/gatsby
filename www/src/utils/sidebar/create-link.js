import React from "react"
import { Link } from "gatsby"

import { colors, space, transition, radii } from "../presets"
import presets from "../../utils/sidebar/presets"

const _getTitle = (title, isDraft) => (isDraft ? title.slice(0, -1) : title)
const _isDraft = title => title.slice(-1) === `*`

const bulletSize = 8

const createLink = ({
  item,
  onLinkClick,
  isActive,
  isParentOfActiveItem,
  stepsUI,
  customCSS,
  level,
  indention,
}) => {
  const isDraft = _isDraft(item.title)
  const title = _getTitle(item.title, isDraft)

  return (
    <span
      css={{
        display: `flex`,
        alignItems: `center`,
        position: `relative`,
        "&:before": {
          background: presets.itemBorderColor,
          bottom: 0,
          top: `auto`,
          content: `''`,
          height: 1,
          position: `absolute`,
          right: 0,
          left: indention,
        },
      }}
    >
      <Link
        css={[
          styles.link,
          isDraft && styles.draft,
          isActive && styles.activeLink,
          isParentOfActiveItem && styles.parentOfActiveLink,
          customCSS && customCSS,
          { paddingLeft: indention },
          {
            "&:before, &:after": {
              left:
                level === 0 || level === 1
                  ? `calc(${indention} - 16px)`
                  : `calc(${indention} - 24px)`,
              top: `1.3em`,
              height: bulletSize,
              position: `absolute`,
              transition: `all ${transition.speed.default} ${
                transition.curve.default
              }`,
            },

            "&:before": {
              background: isActive ? colors.gatsby : false,
              borderRadius: radii[6],
              content: `''`,
              transform: isActive ? `scale(1)` : `scale(0.1)`,
              width: bulletSize,
            },
            "&:after": {
              background: colors.gatsby,
              borderRadius: radii[2],
              content: `''`,
              left:
                level === 0 || level === 1
                  ? `calc(${indention} - 8px)`
                  : `calc(${indention} - 16px)`,
              opacity: isActive ? 1 : 0,
              transform: `translateX(-100px)`,
              width: isActive ? 100 : 1,
            },
          },
        ]}
        onClick={onLinkClick}
        to={item.link}
      >
        {stepsUI && <span css={{ ...styles.subsectionLink }} />}
        {title}
      </Link>
    </span>
  )
}

const styles = {
  draft: {
    "&&": {
      color: colors.gray.calm,
    },
  },
  parentOfActiveLink: {
    "&&": {
      color: colors.gatsby,
      fontWeight: 600,
    },
  },
  activeLink: {
    "&&": {
      color: colors.gatsby,
      fontWeight: 600,
      background: presets.activeSectionBackground,
    },
  },
  link: {
    paddingRight: space[4],
    minHeight: presets.itemMinHeight,
    paddingTop: space[3],
    paddingBottom: space[3],
    position: `relative`,
    zIndex: 1,
    width: `100%`,
    "&&": {
      border: 0,
      color: colors.gray.copy,
      fontWeight: `normal`,
      "&:hover": {
        background: presets.itemHoverBackground,
        color: colors.gatsby,
        "&:before": {
          background: colors.gatsby,
          transform: `scale(1)`,
        },
      },
    },
  },
  subsectionLink: {
    left: space[6],
    background: colors.white,
    border: `1px solid ${colors.ui.bright}`,
    borderRadius: radii[6],
    display: `block`,
    fontWeight: `normal`,
    height: bulletSize,
    position: `absolute`,
    width: bulletSize,
    top: `1.3em`,
    zIndex: -1,
  },
}

export default createLink
