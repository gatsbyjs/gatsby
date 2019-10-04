import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"

import { StarOrnament, QuotationMarkOrnament } from "../../assets/ornaments"

import {
  colors,
  radii,
  space,
  mediaQueries,
  fontSizes,
  lineHeights,
  fonts,
} from "../../utils/presets"

const PullquoteRoot = styled(`blockquote`)`
  border: 1px solid #ebddf2;
  border-radius: ${radii[2]}px;
  color: ${colors.gatsby};
  font-family: ${fonts.header};
  font-size: ${fontSizes[3]};
  font-weight: bold;
  padding: ${space[7]} 3rem;
  position: relative;
  text-indent: ${space[7]};
  margin: ${space[8]} 0;

  /* needed for overriding typography.js style "p *:last-child {"" */
  p > & {
    margin: ${space[8]} 0;
  }

  ${mediaQueries.lg} {
    line-height: ${lineHeights.loose};
    margin: ${space[8]} -3.5rem;
    padding: 2.8rem 3.5rem;
    text-indent: 1.8rem;

    p > & {
      margin: ${space[8]} -3.5rem;
    }
  }
`

const Citation = styled(`cite`)`
  display: block;
  font-style: italic;
  font-weight: normal;
  margin-top: ${space[4]};
  text-align: right;
`

const QuotationMark = styled(`span`)`
  display: flex;
  left: ${space[8]};
  position: absolute;
  top: ${space[7]};

  svg {
    fill: ${colors.purple[80]};
  }

  ${mediaQueries.lg} {
    left: 3rem;
    top: 2.8rem;

    svg {
      fill: ${colors.purple[80]};
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

  :nth-of-type(1) {
    height: 20px;
    left: 0;
    top: 1.8rem;
    transform: translateX(-50%);
    width: 20px;

    svg {
      fill: ${colors.yellow[40]};
    }

    ${mediaQueries.lg} {
      height: 27px;
      width: 27px;
    }

    .variantB & {
      left: auto;
      right: 0;
      top: ${space[7]};
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

  :nth-of-type(2) {
    left: 5rem;
    height: 14px;
    top: 0;
    transform: translateY(-50%);
    width: 14px;

    svg {
      fill: ${colors.teal[40]};
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

  :nth-of-type(3) {
    bottom: 0;
    height: ${space[3]};
    right: 4rem;
    transform: translateY(50%);
    width: ${space[3]};

    svg {
      fill: ${colors.red[60]};
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
