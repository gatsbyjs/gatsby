import React from "react"
import styled from "@emotion/styled"

import HomepageSection from "./homepage-section"
import EmailCaptureForm from "../../components/email-capture-form"

import { NewsletterFormOrnament } from "../../assets/ornaments"

import { rhythm } from "../../utils/typography"
import { mediaQueries } from "../../gatsby-plugin-theme-ui"

const stripedBorderHeight = 1

const Container = styled(`div`)`
  border: 1px solid ${props => props.theme.colors.ui.border.subtle};
  border-radius: ${props => props.theme.radii[2]}px;
  display: flex;
  flex-direction: column;
  margin-bottom: ${props => props.theme.space[8]};
  padding: calc(${props => props.theme.space[8]} * 1.2);
  padding-bottom: calc(
    ${props => rhythm(props.theme.space[8] * 1.2)} +
      ${props => props.theme.space[stripedBorderHeight]}
  );
  position: relative;

  :after {
    border-radius: 0 0 ${props => props.theme.radii[2]}px
      ${props => props.theme.radii[2]}px;
    background: ${props => props.theme.colors.white}
      repeating-linear-gradient(
        135deg,
        ${props => props.theme.colors.yellow[40]},
        ${props => props.theme.colors.yellow[40]} 20px,
        transparent 20px,
        transparent 40px,
        ${props => props.theme.colors.teal[40]} 40px,
        ${props => props.theme.colors.teal[40]} 60px,
        transparent 60px,
        transparent 80px
      );
    bottom: 0;
    content: "";
    height: ${props => props.theme.space[stripedBorderHeight]};
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
  left: -${props => props.theme.space[1]};
  position: absolute;
  top: -${props => props.theme.space[2]};
`

const Name = styled(`h3`)`
  color: ${props => props.theme.colors.lilac};
  font-family: ${props => props.theme.fonts.header};
  font-size: ${props => props.theme.fontSizes[1]};
  font-weight: ${props => props.theme.fontWeights[0]};
  letter-spacing: ${props => props.theme.letterSpacings.tracked};
  margin: 0;
  text-transform: uppercase;
`

const Title = styled(`h1`)`
  color: ${props => props.theme.colors.gatsby};
  font-size: ${props => props.theme.fontSizes[4]};
  font-weight: ${props => props.theme.fontWeights[1]};
  line-height: ${props => props.theme.lineHeights.dense};
  margin: 0;
  margin-top: ${props => props.theme.space[1]};
`

const Form = styled(EmailCaptureForm)`
  margin-top: ${props => props.theme.space[5]};

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
