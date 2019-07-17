import React, { useState } from "react"
import PropTypes from "prop-types"

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
