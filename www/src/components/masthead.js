import React from "react"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

import { rhythm } from "../utils/typography"
import {
  colors,
  space,
  mediaQueries,
  fontSizes,
  lineHeights,
  letterSpacings,
  fonts,
} from "../utils/presets"
import Button from "./button"

const MastheadContent = () => (
  <div
    className="masthead-content"
    css={{
      margin: `0 auto`,
      paddingBottom: space[9],
      paddingTop: space[9],
      paddingLeft: space[8],
      paddingRight: space[8],
      textAlign: `center`,
      [mediaQueries.md]: {
        paddingBottom: rhythm(3),
        paddingTop: rhythm(3),
      },
    }}
  >
    <h1
      css={{
        color: colors.gatsby,
        fontSize: `calc(12px + 2vh + 3vw)`,
        letterSpacing: letterSpacings.tight,
        lineHeight: lineHeights.solid,
        margin: `0 auto ${space[6]}`,
        maxWidth: `15em`,
        WebkitFontSmoothing: `antialiased`,
      }}
    >
      Fast in every way that&nbsp;matters
    </h1>
    <p
      css={{
        fontFamily: fonts.header,
        fontSize: fontSizes[4],
        lineHeight: lineHeights.dense,
        maxWidth: rhythm(30),
        margin: `0 auto ${space[10]}`,
        WebkitFontSmoothing: `antialiased`,
        [mediaQueries.sm]: {
          fontSize: fontSizes[5],
        },
        [mediaQueries.lg]: {
          fontSize: fontSizes[6],
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
