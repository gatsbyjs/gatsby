import React from "react"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

import { rhythm, options } from "../utils/typography"
import presets, { colors, space } from "../utils/presets"
import Button from "./button"

const MastheadContent = () => (
  <div
    className="masthead-content"
    css={{
      margin: `0 ${rhythm(space[8])}`,
      paddingBottom: rhythm(space[9]),
      paddingTop: rhythm(space[9]),
      textAlign: `center`,
      [presets.Md]: {
        paddingBottom: rhythm(3),
        paddingTop: rhythm(3),
      },
    }}
  >
    <h1
      css={{
        color: colors.gatsby,
        fontSize: `calc(12px + 2vh + 3.5vw)`,
        letterSpacing: presets.letterSpacings.tight,
        lineHeight: presets.lineHeights.solid,
        margin: `0 auto ${rhythm(space[7])}`,
        maxWidth: `15em`,
        WebkitFontSmoothing: `antialiased`,
      }}
    >
      Fast in every way that matters
    </h1>
    <p
      css={{
        color: colors.gray.copy,
        fontFamily: options.headerFontFamily.join(`,`),
        fontSize: presets.scale[4],
        maxWidth: rhythm(30),
        margin: `0 auto ${rhythm(space[7])}`,
        WebkitFontSmoothing: `antialiased`,
        [presets.Sm]: {
          fontSize: presets.scale[5],
        },
        [presets.Lg]: {
          fontSize: presets.scale[6],
        },
      }}
    >
      Gatsby is a free and open source framework based on React that helps
      developers build blazing fast <strong>websites</strong> and
      {` `}
      <strong>apps</strong>
    </p>
    <Button
      large
      to="/docs/"
      tracking="MasterHead -> Get Started"
      icon={<ArrowForwardIcon />}
    >
      Get Started
    </Button>
  </div>
)

const Masthead = () => <MastheadContent />

export default Masthead
