/** @jsx jsx */
import { jsx } from "theme-ui"
import { Flex, Heading } from "theme-ui"

import HomepageSection from "./homepage-section"
import EmailCaptureForm from "../email-capture-form"

import { NewsletterFormOrnament } from "../../assets/ornaments"

import { rhythm } from "../../utils/typography"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const stripedBorderHeight = 1

const Container = props => (
  <Flex
    {...props}
    sx={{
      bg: `newsletter.background`,
      border: t => `1px solid ${t.colors.newsletter.border}`,
      borderRadius: 2,
      flexDirection: `column`,
      mb: 8,
      p: t => `calc(${t.space[8]} * 1.2)`,
      pb: t =>
        `calc(${rhythm(t.space[8] * 1.2)} + ${t.space[stripedBorderHeight]})`,
      position: `relative`,

      ":after": {
        borderRadius: t => `0 0 ${t.radii[2]} ${t.radii[2]}`,
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
    }}
  />
)

const Ornament = props => (
  <span
    {...props}
    sx={{
      left: -1,
      position: `absolute`,
      top: -2,
    }}
  />
)

const Name = props => (
  <Heading
    {...props}
    as="h3"
    sx={{
      color: `textMuted`,
      fontFamily: `heading`,
      fontSize: 1,
      fontWeight: `body`,
      letterSpacing: `tracked`,
      m: 0,
      textTransform: `uppercase`,
    }}
  />
)

const Title = props => (
  <Heading
    {...props}
    as="h3"
    sx={{
      color: `newsletter.heading`,
      fontSize: 4,
      fontWeight: `heading`,
      lineHeight: `dense`,
      m: 0,
      mt: 1,
    }}
  />
)

const Form = props => (
  <EmailCaptureForm
    {...props}
    sx={{
      mt: 5,

      [mediaQueries.lg]: {
        mt: 0,
      },
    }}
  />
)

const HomepageNewsletter = () => (
  <HomepageSection>
    <Container>
      <Ornament>
        <NewsletterFormOrnament />
      </Ornament>
      <header>
        <Name>The Gatsby Newsletter</Name>
        <Title>Keep up with the latest things Gatsby!</Title>
      </header>
      <Form
        isHomepage={true}
        confirmMessage="Success! You have been subscribed to the Gatsby newsletter. Expect to see a newsletter in your inbox each Wednesday (or the equivalent of US Wednesday in your time zone)!"
      />
    </Container>
  </HomepageSection>
)

export default HomepageNewsletter
