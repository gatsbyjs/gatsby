import React from "react"
import { Link } from "gatsby"

import { colors, space, transition, radii, breakpoints } from "../presets"
import { rhythm } from "../typography"

const _getTitle = (title, isDraft) => (isDraft ? title.slice(0, -1) : title)
const _isDraft = title => title.slice(-1) === `*`

const createLink = ({
  item,
  onLinkClick,
  isActive,
  isParentOfActiveItem,
  stepsUI,
  customCSS,
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
          background: colors.ui.border,
          bottom: 0,
          top: `auto`,
          content: `''`,
          height: 1,
          position: `absolute`,
          right: 0,
          left: 0,
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

const bulletOffset = {
  default: {
    left: -28,
    top: `1.15em`,
  },
  desktop: {
    top: `1.2em`,
  },
}

const bulletSize = 8

const styles = {
  draft: {
    "&&": {
      color: colors.gray.calm,
    },
  },
  parentOfActiveLink: {
    "&&": {
      color: colors.gatsby,
      fontWeight: `bold`,
    },
  },
  activeLink: {
    "&&": {
      color: colors.gatsby,
      fontWeight: `bold`,
    },
    "&:before": {
      background: colors.gatsby,
      transform: `scale(1)`,
    },
    "&:after": {
      width: 200,
      opacity: 1,
    },
  },
  link: {
    paddingRight: rhythm(space[4]),
    minHeight: 40,
    paddingTop: 10,
    paddingBottom: 10,
    position: `relative`,
    zIndex: 1,
    width: `100%`,
    "&&": {
      border: 0,
      color: colors.gray.lightCopy,
      fontWeight: `normal`,
      "&:hover": {
        background: `transparent`,
        color: colors.gatsby,
        "&:before": {
          background: colors.gatsby,
          transform: `scale(1)`,
        },
      },
    },
    "&:before, &:after": {
      ...bulletOffset.default,
      height: bulletSize,
      position: `absolute`,
      transition: `all ${transition.speed.default} ${transition.curve.default}`,
    },
    "&:before": {
      borderRadius: radii[6],
      content: `''`,
      transform: `scale(0.1)`,
      width: bulletSize,
      [breakpoints.md]: {
        ...bulletOffset.desktop,
      },
    },
    "&:after": {
      background: colors.gatsby,
      borderRadius: radii[2],
      content: `''`,
      left: bulletOffset.default.left + 7,
      opacity: 0,
      transform: `translateX(-200px)`,
      width: 1,
      [breakpoints.md]: {
        ...bulletOffset.desktop,
      },
    },
  },
  subsectionLink: {
    ...bulletOffset.default,
    background: colors.white,
    border: `1px solid ${colors.ui.bright}`,
    borderRadius: radii[6],
    display: `block`,
    fontWeight: `normal`,
    height: bulletSize,
    position: `absolute`,
    width: bulletSize,
    zIndex: -1,
    [breakpoints.md]: {
      ...bulletOffset.desktop,
    },
  },
}

export default createLink
