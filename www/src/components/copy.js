import React, { useState } from "react"
import PropTypes from "prop-types"

import {
  space,
  fonts,
  fontSizes,
  colors,
  radii,
  lineHeights,
  letterSpacings,
} from "../utils/presets"

const copyToClipboard = content => {
  const el = document.createElement(`textarea`)
  el.value = content
  el.setAttribute(`readonly`, ``)
  el.style.position = `absolute`
  el.style.left = `-9999px`
  document.body.appendChild(el)
  el.select()
  document.execCommand(`copy`)
  document.body.removeChild(el)
}

const delay = duration => new Promise(resolve => setTimeout(resolve, duration))

function Copy({ content, duration = 2500, trim = false }) {
  const [text, setText] = useState(`Copy`)

  return (
    <button
      css={{
        background: colors.text.header,
        borderRadius: `0 0 ${radii[2]}px ${radii[2]}px`,
        color: `#ddd`,
        fontSize: fontSizes[0],
        fontFamily: fonts.monospace,
        letterSpacing: letterSpacings.tracked,
        lineHeight: lineHeights.solid,
        padding: `${space[1]} ${space[2]}`,
        position: `absolute`,
        left: space[6],
        textAlign: `right`,
        textTransform: `uppercase`,
        top: `0`,
      }}
      onClick={async () => {
        copyToClipboard(trim ? content.trim() : content)

        setText(`Copied`)

        await delay(duration)

        setText(`Copy`)
      }}
    >
      {text}
    </button>
  )
}

Copy.propTypes = {
  content: PropTypes.string.isRequired,
  duration: PropTypes.number,
  trim: PropTypes.bool,
}

Copy.defaultProps = {
  duration: 2500,
}

export default Copy
