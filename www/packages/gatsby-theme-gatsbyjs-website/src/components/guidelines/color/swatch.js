/** @jsx jsx */
import { jsx } from "theme-ui"
import React, { useState } from "react"
import CopyToClipboard from "react-copy-to-clipboard"

import { Box } from "theme-ui"

export default function Swatch(props) {
  const { a11yLabel, color, swatchStyle, textColor } = props
  const [displayCopied, setDisplayCopied] = useState(false)

  const toggleCopied = () => {
    setDisplayCopied(true)

    setTimeout(() => {
      setDisplayCopied(false)
    }, 2500)
  }

  const handleClick = event => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <Box
      sx={{
        bg: color.hex,
        ...swatchStyle,
        ":hover > .btn-copy": {
          display: `block`,
        },
      }}
    >
      {a11yLabel !== `×` && (
        <Box
          sx={{
            color: textColor,
            fontSize: 0,
            position: `absolute`,
            fontWeight: `body`,
            lineHeight: `dense`,
            top: `auto`,
            bottom: `2px`,
            left: `3px`,
          }}
        >
          {a11yLabel}
        </Box>
      )}

      <CopyToClipboard text={color.hex} onCopy={toggleCopied}>
        <button
          className="btn-copy"
          sx={{
            background: `none`,
            border: 0,
            color: `black`,
            cursor: `pointer`,
            width: `100%`,
            height: `100%`,
            position: `absolute`,
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 1,
            ":focus .tooltip, :hover .tooltip": {
              display: `block`,
            },
          }}
          aria-label={color.hex}
          onClick={handleClick}
        >
          <Box
            className="tooltip"
            sx={{
              bg: `white`,
              boxShadow: `raised`,
              borderRadius: 1,
              fontSize: 1,
              lineHeight: `32px`,
              width: `160px`,
              height: `32px`,
              position: `absolute`,
              top: `-40px`,
              left: 0,
              display: `none`,
            }}
          >
            {displayCopied ? (
              <>Copied to clipboard!</>
            ) : (
              <React.Fragment>
                Copy HEX <code sx={{ bg: `yellow.10` }}>{color.hex}</code>
              </React.Fragment>
            )}
          </Box>
        </button>
      </CopyToClipboard>

      {(color.name || color.base) && (
        <Box
          sx={{
            bg: textColor,
            fontSize: 0,
            lineHeight: `solid`,
            height: 8,
            width: 8,
            position: `absolute`,
            top: `auto`,
            right: `4px`,
            bottom: `4px`,
            borderRadius: 7,
          }}
        />
      )}
    </Box>
  )
}
