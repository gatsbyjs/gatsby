import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"
import { OutboundLink } from "gatsby-plugin-google-analytics"

import { CirclesOrnament } from "../../assets/ornaments"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const CloudCalloutRoot = styled(`div`)`
  border: 1px solid ${p => console.log(p) || p.theme.colors.purple["20"]};
  border-radius: ${p => p.theme.radii[2]};
  font-family: ${p => p.theme.fonts.heading};
  font-size: ${p => p.theme.fontSizes[3]};
  font-weight: bold;
  padding: ${p => p.theme.space[7]} 3rem;
  position: relative;
  margin: ${p => p.theme.space[8]} 0;

  p {
    margin-bottom: 0;
  }

  ${mediaQueries.lg} {
    line-height: ${p => p.theme.lineHeights.loose};
    margin: ${p => p.theme.space[8]} ${p => (p.narrow ? 0 : `-3.5rem`)};
    padding: 2.8rem 3.5rem;
  }
`

const CloudText = styled(`p`)`
  color: ${p => p.theme.colors.text};
  font-weight: normal;
  margin-bottom: 0;
`

const Circles = styled(`span`)`
  display: flex;
  position: absolute;
  bottom: 16px;
  right: 0px;
  transform: translateX(15px);
  color: ${p => p.theme.colors.purple["30"]};
`

const CloudCallout = ({ narrow = true, children }) => {
  return (
    <CloudCalloutRoot narrow={narrow}>
      <CloudText>{children}</CloudText>
      Try <OutboundLink href="https://gatsbyjs.com">Gatsby Cloud</OutboundLink>,
      with CMS and CDN auto-provisioning, performance reports, and 20x faster
      builds!
      <Circles dangerouslySetInnerHTML={{ __html: CirclesOrnament }} />
    </CloudCalloutRoot>
  )
}

CloudCallout.propTypes = {
  children: PropTypes.node.isRequired,
  narrow: PropTypes.bool
}

export default CloudCallout
