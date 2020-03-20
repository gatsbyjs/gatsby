/** @jsx jsx */
import { jsx } from "theme-ui"
import { SkipNavLink } from "@reach/skip-nav"
import { Trans } from "@lingui/macro"

import { visuallyHidden } from "../utils/styles"

const Link = () => (
  <SkipNavLink
    sx={{
      ...visuallyHidden,
      bg: `white`,
      borderRadius: 2,
      boxShadow: `floating`,
      color: `gatsby`,
      fontSize: 1,
      fontWeight: `bold`,
      textDecoration: `none`,
      zIndex: `skipLink`,
      ":focus": {
        clip: `auto`,
        height: `auto`,
        left: t => t.space[6],
        padding: t => t.space[4],
        position: `fixed`,
        top: 6,
        width: `auto`,
      },
    }}
  >
    <Trans>Skip to main content</Trans>
  </SkipNavLink>
)

export default Link
