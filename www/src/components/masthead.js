/** @jsx jsx */
import { jsx } from "theme-ui"
import { MdArrowForward as ArrowForwardIcon } from "react-icons/md"
import { trackCustomEvent } from "gatsby-plugin-google-analytics"

import Button from "./button"

const containerStyles = {
  px: 8,
  py: [9, null, null, 12],
  mx: `auto`,
  mb: [null, null, null, 6],
  textAlign: `center`,
}

const headingStyles = {
  fontSize: `calc(28px + 0.5vh + 1.5vw)`,
  letterSpacing: `tight`,
  lineHeight: `solid`,
  maxWidth: `15em`,
}

const baseTextStyles = {
  color: `text`,
  fontFamily: `heading`,
  lineHeight: `dense`,
  mx: `auto`,
}

const subHeadingStyles = {
  ...baseTextStyles,
  fontSize: [4, 5],
  fontWeight: 400,
  letterSpacing: `normal`,
  maxWidth: `45rem`,
  mt: 0,
  mb: 10,
}

const copyStyles = {
  ...baseTextStyles,
  fontSize: 3,
  maxWidth: `30rem`,
}

export default function Masthead() {
  return (
    <div className="masthead-content" sx={containerStyles}>
      <h1 sx={headingStyles}>Fast in every way that&nbsp;matters</h1>
      <h2 sx={subHeadingStyles}>
        Gatsby is a free and open source framework based on React that helps
        developers build blazing fast <strong>websites</strong> and
        {` `}
        <strong>apps</strong>
      </h2>
      <Button
        variant="large"
        to="/docs/"
        tracking="MasterHead -> Get Started"
        icon={<ArrowForwardIcon />}
        sx={{
          mb: 5,
        }}
      >
        Get Started
      </Button>
      <p sx={copyStyles}>
        Already using Gatsby? Preview, build, and deploy faster with{` `}
        <a
          href="https://www.gatsbyjs.com"
          onClick={() =>
            trackCustomEvent({
              category: `home-masthead`,
              action: `click`,
              label: `Gatsby Cloud`,
            })
          }
        >
          Gatsby Cloud
        </a>
        .
      </p>
    </div>
  )
}
