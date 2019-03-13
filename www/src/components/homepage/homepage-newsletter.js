import React from "react"
import styled from "@emotion/styled"

import HomepageSection from "./homepage-section"
import EmailCaptureForm from "../../components/email-capture-form"

import { NewsletterFormOrnament } from "../../assets/ornaments"

import { rhythm, options } from "../../utils/typography"
import presets, { colors, space, radii } from "../../utils/presets"

const stripedBorderHeight = rhythm(space[2])

const Container = styled(`div`)`
  border: 1px solid ${colors.ui.light};
  border-radius: ${radii[2]}px;
  display: flex;
  flex-direction: column;
  margin-bottom: ${rhythm(space[8])};
  padding: ${rhythm(space[8] * 1.2)};
  padding-bottom: calc(${rhythm(space[8] * 1.2)} + ${stripedBorderHeight});
  position: relative;

  :after {
    border-radius: 0 0 ${radii[2]}px ${radii[2]}px;
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

  ${presets.Lg} {
    flex-direction: row;
    justify-content: space-between;

    > * {
      flex-basis: 50%;
    }
  }
`

const Ornament = styled(`span`)`
  left: -${rhythm(space[1])};
  position: absolute;
  top: -${rhythm(space[2])};
`

const Name = styled(`h3`)`
  color: ${colors.lilac};
  font-family: ${options.headerFontFamily.join(`,`)};
  font-size: ${presets.scale[1]};
  font-weight: normal;
  letter-spacing: ${presets.letterSpacings.tracked};
  margin: 0;
  text-transform: uppercase;
`

const Title = styled(`h1`)`
  color: ${colors.gatsby};
  font-size: ${presets.scale[4]};
  line-height: ${presets.lineHeights.dense};
  margin: 0;
  margin-top: ${rhythm(space[1])};
`

const Form = styled(EmailCaptureForm)`
  margin-top: ${rhythm(space[5])};

  ${presets.Lg} {
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
