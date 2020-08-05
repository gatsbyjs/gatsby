/** @jsx jsx */
import { jsx } from "theme-ui"

import { MdArrowForward as ArrowForwardIcon } from "react-icons/md"

import Container from "../../components/container"
import FuturaParagraph from "../../components/futura-paragraph"
import Button from "../../components/button"

export default function HomepageGetStarted() {
  return (
    <section sx={{ flex: `1 1 100%`, textAlign: `center` }}>
      <Container withSidebar={false}>
        <h1 sx={{ fontWeight: `heading`, mt: 0 }}>Curious yet?</h1>
        <FuturaParagraph>
          It only takes a few minutes to get up and running!
        </FuturaParagraph>
        <Button
          secondary
          variant="large"
          to="/docs/"
          tracking="Curious Yet -> Get Started"
          overrideCSS={{ mt: 5 }}
          icon={<ArrowForwardIcon />}
        >
          Get Started
        </Button>
      </Container>
    </section>
  )
}
