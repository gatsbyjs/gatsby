import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"

import { StarOrnament, QuotationMarkOrnament } from "../../assets/ornaments"

import { options } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"

const PullquoteRoot = styled(`blockquote`)`
  border: 1px solid #ebddf2;
  border-radius: ${presets.radiusLg}px;
  color: ${colors.gatsby};
  font-family: ${options.headerFontFamily.join(`,`)};
  font-size: 1.2rem;
  font-weight: bold;
  line-height: 1.5;
  padding: 2rem 3rem;
  position: relative;
  text-indent: 2rem;

  /* needed for overriding typography.js style "p *:last-child {"" */
  p > & {
    margin: 2.5rem 0;
  }

  ${presets.Desktop} {
    line-height: 1.7;
    padding: 2.8rem 3.5rem;
    text-indent: 1.8rem;

    p > & {
      margin: 2.5rem -3.5rem;
    }
  }
`

const QuotationMark = styled(`span`)`
  display: flex;
  position: absolute;
  top: 2rem;
  left: 2.5rem;

  svg {
    fill: ${colors.gatsbyDark};
  }

  ${presets.Desktop} {
    top: 2.8rem;
    left: 3rem;

    svg {
      fill: ${colors.gatsbyDark};
      transform: scale(1.1);
    }
  }
`

const Star = styled(`span`)`
  position: absolute;
  display: flex;

  svg {
    width: 100%;
    height: 100%;
  }

  :nth-child(1) {
    left: 0;
    height: 20px;
    top: 1.8rem;
    transform: translateX(-50%);
    width: 20px;

    svg {
      fill: ${colors.lemon};
    }

    ${presets.Desktop} {
      height: 27px;
      width: 27px;
    }
  }

  :nth-child(2) {
    left: 5rem;
    height: 14px;
    top: 0;
    transform: translateY(-50%);
    width: 14px;

    svg {
      fill: #73fff7;
    }
  }

  :nth-child(3) {
    bottom: 0;
    height: 12px;
    transform: translateY(50%);
    right: 4rem;
    width: 12px;

    svg {
      fill: #ec1818;
    }
  }
`

const Pullquote = ({ children }) => (
  <PullquoteRoot>
    {children}
    <QuotationMark
      dangerouslySetInnerHTML={{ __html: QuotationMarkOrnament }}
    />
    <div>
      <Star dangerouslySetInnerHTML={{ __html: StarOrnament }} />
      <Star dangerouslySetInnerHTML={{ __html: StarOrnament }} />
      <Star dangerouslySetInnerHTML={{ __html: StarOrnament }} />
    </div>
  </PullquoteRoot>
)

Pullquote.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Pullquote
