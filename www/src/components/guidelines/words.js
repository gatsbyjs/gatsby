import React, { useState } from "react"
import { useTrail, animated } from "react-spring"

const splitAndWrap = string => {
  let theKidsAreDivided = []
  const parts = string.split(/( )/)

  parts.forEach(function(value) {
    if (value !== ` `) {
      theKidsAreDivided.push(
        React.createElement(`span`, {
          dangerouslySetInnerHTML: {
            __html: `${value}`,
          },
          className: `needs-trailing-space`,
        })
      )
    }
  })

  return theKidsAreDivided
}
const getWords = children => {
  let theKidsAreDivided = []

  if (children.length && Array.isArray(children)) {
    children.map(child => {
      if (!child.$$typeof) {
        theKidsAreDivided.push(...splitAndWrap(child))
      } else {
        theKidsAreDivided.push(child)
      }
      return false
    })
  } else {
    theKidsAreDivided.push(...splitAndWrap(children))
  }

  return theKidsAreDivided
}

const Words = ({ children, config }) => {
  const [toggle] = useState(true)
  const items = getWords(children)

  const trail = useTrail(items.length, {
    config: config ? config : { clamp: true },
    x: toggle ? 0 : 80,
    height: toggle ? `auto` : 0,
    from: { x: 80, height: 0 },
  })

  return (
    <div
      css={{
        height: `100%`,
      }}
    >
      {trail.map(({ x, height, ...rest }, index) => (
        <span key={`trail-${index}`}>
          <animated.span
            style={{
              ...rest,
              display: `inline-block`,
              overflow: `hidden`,
              lineHeight: 1.1,
              position: `relative`,
              willChange: `transform, opacity`,
            }}
          >
            <animated.span
              style={{
                display: `inline-block`,
                transform: x.interpolate(x => `translate3d(0,${x}px,0)`),
              }}
            >
              {items[index]}
            </animated.span>
          </animated.span>
          {items[index].props.className === `needs-trailing-space` && (
            <span> </span>
          )}
        </span>
      ))}
    </div>
  )
}

export default Words
