/** @jsx jsx */
import { jsx, Flex } from "theme-ui"

import HomepageSection from "./homepage-section"
import EmailCaptureForm from "../email-capture-form"

import { NewsletterFormOrnament } from "../../assets/ornaments"

import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const stripedBorderHeight = 1

const containerStyles = {
  bg: `newsletter.background`,
  borderColor: `newsletter.border`,
  borderStyle: `solid`,
  borderWidth: 1,
  borderRadius: 2,
  flexDirection: `column`,
  mb: 8,
  p: 9,
  pb: t => `calc(${t.space[9]} + ${t.space[stripedBorderHeight]})`,
  position: `relative`,

  ":after": {
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    background: t => `${t.colors.newsletter.background}
      repeating-linear-gradient(
        135deg,
        ${t.colors.newsletter.stripeColorA},
        ${t.colors.newsletter.stripeColorA} 20px,
        transparent 20px,
        transparent 40px,
        ${t.colors.newsletter.stripeColorB} 40px,
        ${t.colors.newsletter.stripeColorB} 60px,
        transparent 60px,
        transparent 80px
      )`,
    bottom: 0,
    content: `""`,
    height: t => t.space[stripedBorderHeight],
    left: 0,
    right: 0,
    position: `absolute`,
  },

  [mediaQueries.lg]: {
    flexDirection: `row`,
    justifyContent: `space-between`,

    "> *": {
      flexBasis: `50%`,
    },
  },
}

const nameStyles = {
  color: `textMuted`,
  fontFamily: `heading`,
  fontSize: 1,
  fontWeight: `body`,
  letterSpacing: `tracked`,
  m: 0,
  textTransform: `uppercase`,
}

const titleStyles = {
  color: `newsletter.heading`,
  fontSize: 4,
  fontWeight: `heading`,
  lineHeight: `dense`,
  m: 0,
  mt: 1,
}

export default function HomepageNewsletter() {
  return (
    <HomepageSection>
      <Flex sx={containerStyles}>
        <NewsletterFormOrnament
          sx={{
            left: -1,
            position: `absolute`,
            top: -2,
          }}
        />
        <header>
          <h3 sx={nameStyles}>The Gatsby Newsletter</h3>
          <h1 sx={titleStyles}>Keep up with the latest things Gatsby!</h1>
        </header>
        <EmailCaptureForm
          isHomepage
          confirmMessage="Success! You have been subscribed to the Gatsby newsletter. Expect to see a newsletter in your inbox each Wednesday (or the equivalent of US Wednesday in your time zone)!"
          sx={{ mt: [5, null, null, null, 0] }}
        />
      </Flex>
    </HomepageSection>
  )
}
