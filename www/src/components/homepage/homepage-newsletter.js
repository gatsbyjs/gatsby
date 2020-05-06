import React from "react"
import styled from "@emotion/styled"

import HomepageSection from "./homepage-section"
import EmailCaptureForm from "../email-capture-form"

import { NewsletterFormOrnament } from "../../assets/ornaments"

import { rhythm } from "../../utils/typography"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const stripedBorderHeight = 1

const Container = styled(`div`)`
  background: ${p => p.theme.colors.newsletter.background};
  border: 1px solid ${p => p.theme.colors.newsletter.border};
  border-radius: ${p => p.theme.radii[2]};
  display: flex;
  flex-direction: column;
  margin-bottom: ${p => p.theme.space[8]};
  padding: calc(${p => p.theme.space[8]} * 1.2);
  padding-bottom: calc(
    ${props => rhythm(props.theme.space[8] * 1.2)} +
      ${p => p.theme.space[stripedBorderHeight]}
  );
  position: relative;

  :after {
    border-radius: 0 0 ${p => p.theme.radii[2]} ${p => p.theme.radii[2]};
    background: ${p => p.theme.colors.newsletter.background}
      repeating-linear-gradient(
        135deg,
        ${p => p.theme.colors.newsletter.stripeColorA},
        ${p => p.theme.colors.newsletter.stripeColorA} 20px,
        transparent 20px,
        transparent 40px,
        ${p => p.theme.colors.newsletter.stripeColorB} 40px,
        ${p => p.theme.colors.newsletter.stripeColorB} 60px,
        transparent 60px,
        transparent 80px
      );
    bottom: 0;
    content: "";
    height: ${p => p.theme.space[stripedBorderHeight]};
    left: 0;
    right: 0;
    position: absolute;
  }

  ${mediaQueries.lg} {
    flex-direction: row;
    justify-content: space-between;

    > * {
      flex-basis: 50%;
    }
  }
`

const Ornament = styled(`span`)`
  left: -${p => p.theme.space[1]};
  position: absolute;
  top: -${p => p.theme.space[2]};
`

const Name = styled(`h3`)`
  color: ${p => p.theme.colors.textMuted};
  font-family: ${p => p.theme.fonts.heading};
  font-size: ${p => p.theme.fontSizes[1]};
  font-weight: ${p => p.theme.fontWeights.body};
  letter-spacing: ${p => p.theme.letterSpacings.tracked};
  margin: 0;
  text-transform: uppercase;
`

const Title = styled(`h1`)`
  color: ${p => p.theme.colors.newsletter.heading};
  font-size: ${p => p.theme.fontSizes[4]};
  font-weight: ${p => p.theme.fontWeights.heading};
  line-height: ${p => p.theme.lineHeights.dense};
  margin: 0;
  margin-top: ${p => p.theme.space[1]};
`

const Form = styled(EmailCaptureForm)`
  margin-top: ${p => p.theme.space[5]};

  ${mediaQueries.lg} {
    margin-top: 0;
  }
`

const HomepageNewsletter = () => (
  <HomepageSection>
    <Container>
      <Ornament dangerouslySetInnerHTML={{ __html: NewsletterFormOrnament }} />
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
