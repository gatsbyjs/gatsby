import React from "react"
import { StarOrnament, QuotationMarkOrnament } from "../../assets/ornaments"

function Citation({ author }) {
  return (
    <cite
      sx={{
        display: `block`,
        fontStyle: `italic`,
        fontWeight: `normal`,
        mt: 4,
        textAlign: `right`,
      }}
    >
      &mdash; {author}
    </cite>
  )
}

function QuotationMark() {
  return (
    <span
      sx={{
        display: `flex`,
        position: `absolute`,
        left: [8, null, null, 9],
        top: [7, null, null, `2.8rem`],

        svg: {
          fill: `purple.80`,
          transform: [null, null, null, `scale(1.1)`],
        },
      }}
    >
      <QuotationMarkOrnament />
    </span>
  )
}

const starColorStyle = {
  yellow: { size: [5, null, null, `27px`], fill: `yellow.40` },
  teal: { size: `14px`, fill: `teal.40` },
  red: { size: 3, fill: `red.60` },
}

const starPositionStyle = {
  yellow: [
    { left: 0, top: `1.8rem`, transform: `translateX(-50%)` },
    { right: 0, top: 7, transform: `translate(50%, 0)` },
    { bottom: 0, right: 3, transform: `translate(0, 50%)` },
  ],
  teal: [
    { left: `5rem`, top: 0, transform: `translateY(-50%)` },
    { bottom: 0, right: 9, transform: `translate(0, 50%)` },
    { right: `9rem`, top: 0, transform: `translate(0, -50%)` },
  ],
  red: [
    { bottom: 0, right: 1, transform: `translateY(50%)` },
    { right: `7rem`, top: 0, transform: `translate(0%, -50%)` },
    { top: 9, left: 0, transform: `translate(-50%, 0)` },
  ],
}

function Star({ color, order }) {
  const { size, fill } = starColorStyle[color]
  const positionStyle = starPositionStyle[color][order]

  return (
    <span
      sx={{
        display: `flex`,
        position: `absolute`,
        width: size,
        height: size,

        svg: {
          height: `100%`,
          width: `100%`,
          fill,
        },
        ...positionStyle,
      }}
    >
      <StarOrnament />
    </span>
  )
}

let instancesCounter = -1

function Stars() {
  instancesCounter += 1
  const order = instancesCounter % 3
  return (
    <div>
      {[`yellow`, `red`, `teal`].map(color => (
        <Star key={color} color={color} order={order} />
      ))}
    </div>
  )
}

export default function Pullquote({ citation, narrow = false, children }) {
  return (
    <blockquote
      sx={{
        borderWidth: `1px`,
        borderStyle: `solid`,
        borderColor: `pullquote.borderColor`,
        borderRadius: 2,
        color: `pullquote.color`,
        fontFamily: `heading`,
        fontSize: 3,
        fontWeight: `bold`,
        py: [7, null, null, `2.8rem`],
        px: [9, null, null, 10],
        position: `relative`,
        textIndent: [t => t.space[7], null, null, `1.8rem`],
        my: 8,
        mx: [null, null, null, narrow ? 0 : `-3.5rem`],
        // Needed for overriding typography.js style "p *:last-child {"""
        "p > &": {
          my: 8,
          mx: [null, null, null, narrow ? 0 : `-3.5rem`],
        },
        lineHeight: [null, null, null, `loose`],
      }}
    >
      {children}
      {citation && <Citation author={citation} />}
      <QuotationMark />
      <Stars />
    </blockquote>
  )
}
