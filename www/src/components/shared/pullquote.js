/** @jsx jsx */
import { jsx } from "theme-ui"
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
      }}
    >
      <QuotationMarkOrnament
        sx={{
          fill: `purple.80`,
          transform: [null, null, null, `scale(1.1)`],
        }}
      />
    </span>
  )
}

const starStyle = {
  yellow: { size: [`20px`, null, null, `27px`], fill: `yellow.40` },
  teal: { size: `14px`, fill: `teal.40` },
  red: { size: `12px`, fill: `red.60` },
}

const starPositionStyles = [
  {
    yellow: { side: `left`, offset: `1.8rem` },
    teal: { side: `top`, offset: `5rem` },
    red: { side: `bottom`, offset: `4rem`, fromEnd: true },
  },
  {
    yellow: { side: `right`, offset: `2rem` },
    teal: { side: `bottom`, offset: `3rem`, fromEnd: true },
    red: { side: `top`, offset: `7rem`, fromEnd: true },
  },
  {
    yellow: { side: `bottom`, offset: `12rem`, fromEnd: true },
    teal: { side: `top`, offset: `9rem`, fromEnd: true },
    red: { side: `left`, offset: `3rem` },
  },
]

// [X, Y] amount to translate the star for each side (in %)
const starTranslate = {
  left: [-50, 0],
  right: [50, 0],
  top: [0, -50],
  bottom: [0, 50],
}

// Get the cross axis of the side the star is on to calculate the offset.
// For example, is a star is on the left side, the star should be offset from the top.
// If `fromEnd` is true, the star will be aligned according to the end instead of the start.
// For example, if `side === left`, then the star is offset from the bottom instead of the top.
function crossAxis(side, fromEnd) {
  if ([`left`, `right`].includes(side)) {
    return fromEnd ? `bottom` : `top`
  } else {
    return fromEnd ? `right` : `left`
  }
}

function Star({ color, order }) {
  const { size, fill } = starStyle[color]
  const { side, offset, fromEnd } = starPositionStyles[order][color]
  const translate = starTranslate[side]

  return (
    <span
      sx={{
        display: `flex`,
        position: `absolute`,
        width: size,
        height: size,
        [side]: 0,
        [crossAxis(side, fromEnd)]: offset,
        transform: `translate(${translate[0]}%,${translate[1]}%)`,
      }}
    >
      <StarOrnament sx={{ height: `100%`, width: `100%`, fill }} />
    </span>
  )
}

let instancesCounter = -1

function Stars() {
  // We want to vary the placement of the stars so consecutive pullquotes
  // have stars in different positions.
  instancesCounter += 1
  const order = instancesCounter % starPositionStyles.length
  return (
    <div>
      {[`yellow`, `red`, `teal`].map(color => (
        <Star key={color} color={color} order={order} />
      ))}
    </div>
  )
}

/**
 * A component used to call out a quote in the blog.
 * It applies borders and styles that make a section of the content pop out to readers.
 *
 * @param citation the reference of the person or entity that made the quoted statement
 * @param children the content to be quoted
 * @param narrow
 * Keep the pullquote inside the parent container.
 * Should be used if using the pullquote in the docs to make sure it stays inside its container.
 */
export default function Pullquote({ citation, narrow = false, children }) {
  return (
    <blockquote
      sx={{
        border: 1,
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
        lineHeight: [null, null, null, `loose`],
        my: 8,
        mx: [null, null, null, narrow ? 0 : `-3.5rem`],
        // Needed for overriding typography.js style "p *:last-child {"""
        "p > &": {
          my: 8,
          mx: [null, null, null, narrow ? 0 : `-3.5rem`],
        },
      }}
    >
      {children}
      {citation && <Citation author={citation} />}
      <QuotationMark />
      <Stars />
    </blockquote>
  )
}
