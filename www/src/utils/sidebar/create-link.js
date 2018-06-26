import Link from "gatsby-link"
import React from "react"
import presets, { colors } from "../presets"
import { options } from "../typography"

const _getTitle = (title, isDraft) => (isDraft ? title.slice(0, -1) : title)
const _isDraft = title => title.slice(-1) === `*`

const createLinkDocs = ({
  isActive,
  item,
  section,
  onLinkClick,
  isParentOfActiveItem,
}) => {
  const isDraft = _isDraft(item.title)
  const title = _getTitle(item.title, isDraft)

  return (
    <Link
      css={[
        styles.link,
        isDraft && styles.draft,
        isActive && styles.activeLink,
        isParentOfActiveItem && styles.parentOfActiveLink,
      ]}
      onClick={onLinkClick}
      to={`/${section.directory}${item.link}`}
    >
      {title}
    </Link>
  )
}

const createLinkTutorial = ({
  isActive,
  item,
  section,
  onLinkClick,
  isParentOfActiveItem,
  isSubsectionLink,
}) => {
  const isDraft = _isDraft(item.title)
  const title = _getTitle(item.title, isDraft)

  return (
    <Link
      css={[
        styles.link,
        isDraft && styles.draft,
        isActive && styles.activeLink,
        isParentOfActiveItem && styles.parentOfActiveLink,
      ]}
      onClick={onLinkClick}
      to={`/${section.directory}${item.link}`}
    >
      {isSubsectionLink && <span css={{ ...styles.subsectionLink }} />}
      {title}
    </Link>
  )
}

const bulletOffset = {
  left: `-1rem`,
  top: `.3rem`,
}

const bulletSize = 7

const styles = {
  draft: {
    "&&": {
      color: colors.gray.calm,
      fontStyle: `italic`,
    },
  },
  parentOfActiveLink: {
    "&:after": {
      display: `none`,
    },
    "&:before": {
      display: `none`,
    },
  },
  activeLink: {
    "&&": {
      color: colors.gatsby,
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
    position: `relative`,
    "&&": {
      border: 0,
      boxShadow: `none`,
      fontFamily: options.systemFontFamily.join(`,`),
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
    "&:before": {
      borderRadius: `100%`,
      content: ` `,
      fontWeight: `normal`,
      height: bulletSize,
      position: `absolute`,
      width: bulletSize,
      ...bulletOffset,
      transform: `scale(0.1)`,
      transition: `all ${presets.animation.speedDefault} ${
        presets.animation.curveDefault
      }`,
    },
    "&:after": {
      background: colors.gatsby,
      borderRadius: 4,
      content: ` `,
      height: bulletSize,
      position: `absolute`,
      opacity: 0,
      ...bulletOffset,
      left: `-0.75rem`,
      transform: `translateX(-200px)`,
      transition: `all ${presets.animation.speedDefault} ${
        presets.animation.curveDefault
      }`,
      width: 1,
    },
  },
  subsectionLink: {
    background: `#fff`,
    border: `1px solid ${colors.lilac}`,
    borderRadius: `100%`,
    display: `block`,
    fontWeight: `normal`,
    height: bulletSize,
    width: bulletSize,
    ...bulletOffset,
    position: `absolute`,
    zIndex: -1,
  },
}

export { createLinkDocs, createLinkTutorial }
