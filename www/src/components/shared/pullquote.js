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
  margin: 2.5rem 0;

  /* needed for overriding typography.js style "p *:last-child {"" */
  p > & {
    margin: 2.5rem 0;
  }

  ${presets.Desktop} {
    line-height: 1.7;
    margin: 2.5rem -3.5rem;
    padding: 2.8rem 3.5rem;
    text-indent: 1.8rem;

    p > & {
      margin: 2.5rem -3.5rem;
    }
  }
`

const Citation = styled(`cite`)`
  display: block;
  font-style: italic;
  font-weight: normal;
  margin-top: 1rem;
  text-align: right;
`

const QuotationMark = styled(`span`)`
  display: flex;
  left: 2.5rem;
  position: absolute;
  top: 2rem;

  svg {
    fill: ${colors.gatsbyDark};
  }

  ${presets.Desktop} {
    left: 3rem;
    top: 2.8rem;

    svg {
      fill: ${colors.gatsbyDark};
      transform: scale(1.1);
    }
  }
`

const Star = styled(`span`)`
  display: flex;
  position: absolute;

  svg {
    height: 100%;
    width: 100%;
  }

  :nth-child(1) {
    height: 20px;
    left: 0;
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

    .variantB & {
      left: auto;
      right: 0;
      top: 2rem;
      transform: translate(50%, 0);
    }

    .variantC & {
      bottom: 0;
      left: auto;
      right: 12rem;
      top: auto;
      transform: translate(0, 50%);
    }
  }

  :nth-child(2) {
    left: 5rem;
    height: 14px;
    top: 0;
    transform: translateY(-50%);
    width: 14px;

    svg {
      fill: ${colors.mint};
    }
    .variantB & {
      bottom: 0;
      left: auto;
      right: 3rem;
      top: auto;
      transform: translate(0, 50%);
    }

    .variantC & {
      left: auto;
      right: 9rem;
      top: 0;
      transform: translate(0, -50%);
    }
  }

  :nth-child(3) {
    bottom: 0;
    height: 12px;
    right: 4rem;
    transform: translateY(50%);
    width: 12px;

    svg {
      fill: ${colors.warning};
    }

    .variantB & {
      bottom: auto;
      left: auto;
      right: 7rem;
      top: 0;
      transform: translate(0%, -50%);
    }

    .variantC & {
      top: 3rem;
      left: 0;
      transform: translate(-50%, 0);
    }
  }
`

const variants = [`A`, `B`, `C`]
let instancesCounter = -1

const Pullquote = ({ citation, children }) => {
  instancesCounter += 1
  const className = `variant${variants[instancesCounter % variants.length]}`

  return (
    <PullquoteRoot className={className}>
      {children}
      {citation && <Citation>&mdash; {citation}</Citation>}
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
}

Pullquote.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Pullquote
