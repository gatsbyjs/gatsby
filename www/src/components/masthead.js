import React from "react"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

import { rhythm, scale, options } from "../utils/typography"
import presets, { colors } from "../utils/presets"
import Button from "./button"

const MastheadContent = () => (
  <div
    className="masthead-content"
    css={{
      margin: `0 ${rhythm(presets.gutters.default)}`,
      paddingTop: rhythm(4),
      paddingBottom: rhythm(1),
      textAlign: "center",
      [presets.Mobile]: {
        paddingBottom: rhythm(2),
      },
      [presets.Tablet]: {
        paddingTop: rhythm(5),
      },
      [presets.Desktop]: {
        paddingTop: rhythm(5),
      },
      [presets.Hd]: {
        paddingTop: rhythm(5),
        paddingBottom: rhythm(3),
      },
    }}
  >
    <h1
      css={{
        color: colors.gatsby,
        fontSize: `calc(12px + 2vh + 2vw)`,
        lineHeight: 1.1,
        maxWidth: "11em",
        margin: "0 auto 1.75rem",
        padding: 0,
        letterSpacing: "-0.25",
      }}
    >
      Build blazing fast apps and websites with React
    </h1>
    <p
      css={{
        color: colors.gray.copy,
        fontFamily: options.headerFontFamily.join(`,`),
        maxWidth: rhythm(26),
        margin: "0 auto 2rem",
        fontSize: scale(1 / 5).fontSize,
        [presets.Phablet]: {
          fontSize: scale(3 / 5).fontSize,
        },
      }}
    >
      Gatsby is a free and open source developer framework based on React for
      building blazing fast websites and apps
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
