import React from "react"
import styled from "react-emotion"

import HomepageSection, { Name, Title } from "./homepage-section"
import EmailCaptureForm from "../../components/email-capture-form"

import { NewsletterFormOrnament } from "../../assets/ornaments"

import { rhythm, options } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"

const HomepageNewsletterRoot = styled(HomepageSection)`
  padding: calc(${rhythm(presets.gutters.default)} * 2);
  padding-bottom: calc(${rhythm(presets.gutters.default)} * 3);
  position: relative;
  z-index: 0;

  ${Name} {
    font-fa1mily: ${options.headerFontFamily.join(`,`)};
    font-size: 0.875rem;
    margin-left: 0;
    margin-bottom: 0.2rem;
    text-transform: uppercase;
  }

  ${Title} {
    font-size: 1.25rem;
    line-height: 1.3;
    margin-bottom: 1.25rem;
  }

  :before {
    border: 1px solid ${colors.ui.light};
    border-radius: ${presets.radiusLg}px;
    bottom: ${rhythm(presets.gutters.default * 1.5)};
    content: "";
    left: ${rhythm(presets.gutters.default / 2)};
    position: absolute;
    right: ${rhythm(presets.gutters.default / 2)};
    top: ${rhythm(presets.gutters.default / 2)};
    z-index: -1;
  }

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
    bottom: ${rhythm(presets.gutters.default * 1.5)};
    content: "";
    height: 8px;
    left: ${rhythm(presets.gutters.default / 2)};
    right: ${rhythm(presets.gutters.default / 2)};
    position: absolute;
    z-index: -2;
  }
`

const Ornament = styled(`span`)`
  left: calc(${rhythm(presets.gutters.default / 2)} - 4px);
  position: absolute;
  top: calc(${rhythm(presets.gutters.default / 2)} - 8px);
`

const HomepageNewsletter = () => (
  <HomepageNewsletterRoot
    sectionName="The Gatsby Newsletter"
    title="Keep up with the latest things Gatsby!"
  >
    <Ornament dangerouslySetInnerHTML={{ __html: NewsletterFormOrnament }} />
    <EmailCaptureForm
      isHomepage={true}
      confirmMessage="Success! You have been subscribed to the Gatsby newsletter. Expect to see a newsletter in your inbox each Wednesday (or the equivalent of US Wednesday in your time zone)!"
    />
  </HomepageNewsletterRoot>
)

export default HomepageNewsletter
