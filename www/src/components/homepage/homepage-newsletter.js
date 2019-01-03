import React from "react"
import styled from "react-emotion"

import HomepageSection from "./homepage-section"
import EmailCaptureForm from "../../components/email-capture-form"

import { NewsletterFormOrnament } from "../../assets/ornaments"

import { rhythm, options } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"

const stripedBorderHeight = `8px`

const Container = styled(`div`)`
  border: 1px solid ${colors.ui.light};
  border-radius: ${presets.radiusLg}px;
  display: flex;
  flex-direction: column;
  margin-bottom: ${rhythm(presets.gutters.default)};
  padding: ${rhythm(presets.gutters.default * 1.2)};
  padding-bottom: calc(
    ${rhythm(presets.gutters.default * 1.2)} + ${stripedBorderHeight}
  );
  position: relative;

  :after {
    border-radius: 0 0 ${presets.radiusLg}px ${presets.radiusLg}px;
    background: ${colors.ui.whisper}
      repeating-linear-gradient(
        135deg,
        ${colors.lemon},
        ${colors.lemon} 20px,
        transparent 20px,
        transparent 40px,
        ${colors.mint} 40px,
        ${colors.mint} 60px,
        transparent 60px,
        transparent 80px
      );
    bottom: 0;
    content: "";
    height: ${stripedBorderHeight};
    left: 0;
    right: 0;
    position: absolute;
  }

  ${presets.Desktop} {
    flex-direction: row;
    justify-content: space-between;

    > * {
      flex-basis: 50%;
    }
  }
`

const Ornament = styled(`span`)`
  left: -4px;
  position: absolute;
  top: -8px;
`

const Name = styled(`h3`)`
  color: ${colors.lilac};
  font-family: ${options.headerFontFamily.join(`,`)};
  font-size: 0.875rem;
  font-weight: normal;
  margin: 0;
  text-transform: uppercase;
`

const Title = styled(`h1`)`
  color: ${colors.gatsby};
  font-size: 1.25rem;
  line-height: 1.3;
  margin: 0;
  margin-top: 0.2rem;
`

const Form = styled(EmailCaptureForm)`
  margin-top: 1.25rem;

  ${presets.Desktop} {
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
