/** @jsx jsx */
import { jsx } from "theme-ui"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

import Button from "./button"

const MastheadContent = () => (
  <div>
    <h1
      sx={{
        fontSize: [8, null, null, 9, null, 11],
        letterSpacing: `tight`,
        lineHeight: `solid`,
        maxWidth: `15em`,
        mb: 6,
        mt: 12,
      }}
    >
      Fast in every way that&nbsp;matters<span sx={{ color: `gatsby` }}>.</span>
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
