/** @jsx jsx */
import { jsx } from "theme-ui"
import { t, Trans } from "@lingui/macro"
import { withI18n } from "@lingui/react"
import Link from "./localized-link"
import {
  MdArrowBack as ArrowBackIcon,
  MdArrowForward as ArrowForwardIcon,
} from "react-icons/md"

import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const prevNextLinkStyles = {
  // bump specificity to override the border applied to Link's by default
  "&&": {
    borderBottom: 0,
  },
  color: `gatsby`,
  fontFamily: `heading`,
  fontSize: 3,
  fontWeight: `bold`,
  lineHeight: `dense`,
}
const prevNextLabelStyles = {
  color: `textMuted`,
  fontSize: 2,
  fontWeight: `body`,
  mb: 2,
  mt: 0,
}

const PrevAndNext = ({ prev = null, next = null, i18n, ...props }) => {
  if (!prev && !next) {
    return null
  }

  return (
    <nav
      aria-label={i18n._(t`pagination`)}
      sx={{
        [mediaQueries.sm]: {
          display: `flex`,
          justifyContent: `space-between`,
          width: `100%`,
        },
      }}
      {...props}
    >
      <div css={{ [mediaQueries.sm]: { width: `48%` } }}>
        {prev && (
          <Link to={prev.link} sx={prevNextLinkStyles}>
            <p sx={prevNextLabelStyles}>
              <Trans>Previous</Trans>
            </p>
            <span
              sx={{
                [mediaQueries.md]: {
                  ml: `-1.5em`,
                },
                display: `inline-flex`,
                alignItems: `center`,
              }}
            >
              <ArrowBackIcon
                sx={{
                  flexShrink: 0,
                  mr: `0.5em`,
                  verticalAlign: `sub`,
                }}
              />
              {prev.title}
            </span>
          </Link>
        )}
      </div>
      <div
        sx={{
          textAlign: `right`,
          mt: 5,
          [mediaQueries.sm]: { mt: 0, width: `48%` },
        }}
      >
        {next && (
          <Link to={next.link} sx={prevNextLinkStyles}>
            <p sx={prevNextLabelStyles}>
              <Trans>Next</Trans>
            </p>
            <span
              sx={{
                [mediaQueries.md]: {
                  mr: `-1.5em`,
                },
                display: `inline-flex`,
                alignItems: `center`,
              }}
            >
              {next.title}
              <ArrowForwardIcon
                sx={{
                  flexShrink: 0,
                  ml: `0.5em`,
                  verticalAlign: `sub`,
                }}
              />
            </span>
          </Link>
        )}
      </div>
    </nav>
  )
}

export default withI18n()(PrevAndNext)
