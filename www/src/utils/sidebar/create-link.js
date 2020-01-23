/** @jsx jsx */
import { jsx } from "theme-ui"
import Link from "../../components/localized-link"

import indention from "../../utils/sidebar/indention"

const _getTitle = (title, isDraft) => (isDraft ? title.slice(0, -1) : title)
const _isDraft = title => title.slice(-1) === `*`

const bulletSize = 8
const bulletSizeActive = 100
const bulletOffsetTop = `1.3em`

const createLink = ({
  item,
  onLinkClick,
  isActive,
  isParentOfActiveItem,
  ui,
  overrideCSS,
  level,
}) => {
  const isDraft = _isDraft(item.title)
  const title = _getTitle(item.title, isDraft)
  const indent = ui === `steps` ? indention(level + 1) : indention(level)

  return (
    <span
      sx={{
        alignItems: `center`,
        display: `flex`,
        position: `relative`,
        "&:before": {
          bg: `sidebar.itemBorderColor`,
          bottom: 0,
          content: `''`,
          height: 1,
          left: indent,
          position: `absolute`,
          right: 0,
          top: `auto`,
        },
      }}
    >
      <Link
        sx={{
          minHeight: `sidebarItemMinHeight`,
          position: `relative`,
          pl: indent,
          pr: 4,
          py: 3,
          textDecoration: `none`,
          width: `100%`,
          zIndex: 1,
          "&&": {
            border: 0,
            color: `navigation.linkDefault`,
            fontWeight: `body`,
            ...(isDraft && {
              color: `textMuted`,
            }),
            ...(isActive && {
              color: `link.color`,
              fontWeight: `medium`,
            }),
            ...(isParentOfActiveItem && {
              bg: `sidebar.itemBackgroundActive`,
              color: `link.color`,
              fontWeight: `medium`,
            }),
            "&:hover": {
              bg: `sidebar.itemHoverBackground`,
              color: `navigation.linkHover`,
              "&:before": {
                bg: `link.color`,
                transform: `scale(1)`,
              },
            },
            ...overrideCSS,
          },
          "&:before, &:after": {
            content: `''`,
            left: t =>
              level === 0 || (level === 1 && ui !== `steps`)
                ? `calc(${indent} - ${t.space[4]})`
                : `calc(${indent} - ${t.space[6]})`,
            top: bulletOffsetTop,
            height: bulletSize,
            position: `absolute`,
            transition: t =>
              `all ${t.transition.speed.default} ${t.transition.curve.default}`,
            width: bulletSize,
          },
          "&:before": {
            bg: isActive ? `link.color` : false,
            borderRadius: 6,
            transform: isActive ? `scale(1)` : `scale(0.1)`,
          },
          "&:after": {
            bg: `link.color`,
            borderRadius: 2,
            opacity: isActive ? 1 : 0,
            transform: `translateX(-${bulletSizeActive - bulletSize}px)`,
            width: isActive ? bulletSizeActive : 0,
          },
        }}
        onClick={onLinkClick}
        to={item.link}
      >
        {ui === `steps` && (
          <span
            sx={{
              bg: `white`,
              borderColor: `ui.border`,
              borderRadius: 6,
              borderStyle: `solid`,
              borderWidth: `1px`,
              display: `block`,
              fontWeight: `body`,
              height: bulletSize,
              left: 6,
              position: `absolute`,
              top: bulletOffsetTop,
              width: bulletSize,
              zIndex: -1,
            }}
          />
        )}
        {title}
      </Link>
    </span>
  )
}

export default createLink
