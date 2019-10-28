/** @jsx jsx */
import { jsx } from "theme-ui"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

import Button from "../button"

const MastheadContent = () => (
  <div
    sx={{
      maxWidth: 620,
      mt: [6, null, null, 12],
      px: [6, null, null, 11],
      textAlign: [`center`, null, null, `left`],
    }}
  >
    <h1
      sx={{
        fontSize: [7, 8, null, 9, null, 10],
        letterSpacing: `tight`,
        lineHeight: `solid`,
        maxWidth: `15em`,
        mb: 8,
        // fontWeight: "heading",
        // background: `#f00`,
      }}
    >
      Fast in every way that&nbsp;matters
      {/* <span sx={{ color: `gatsby` }}>.</span> */}
    </h1>
    <p
      sx={{
        color: `text`,
        fontFamily: `header`,
        fontSize: [4, null, null, 5],
        lineHeight: `dense`,
        maxWidth: `45rem`,
        mb: 10,
        mt: 0,
      }}
    >
      Gatsby is a free and open source framework based on React that helps
      developers build blazing fast <strong>websites</strong> and
      {` `}
      <strong>apps</strong>
    </p>
    <Button
      variant="large"
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
