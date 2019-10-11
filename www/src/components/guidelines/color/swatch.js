/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import CopyToClipboard from "react-copy-to-clipboard"

import { Box } from "../system"

export default class Swatch extends React.Component {
  state = {
    value: this.props.color.hex,
    displayCopied: false,
  }

  toggleCopied = () => {
    this.setState({
      displayCopied: true,
    })

    setTimeout(() => {
      this.setState({
        displayCopied: false,
      })
    }, 2500)
  }

  handleClick = event => {
    event.preventDefault()
    event.stopPropagation()
  }

  render() {
    const { a11yLabel, color, swatchStyle, textColor } = this.props

    return (
      <Box
        bg={color.hex}
        sx={{
          ...swatchStyle,
          ":hover > .btn-copy": {
            display: `block`,
          },
        }}
      >
        {a11yLabel !== `×` && (
          <Box
            color={textColor}
            fontSize={0}
            position="absolute"
            fontWeight="body"
            sx={{
              bottom: `2px`,
              left: `3px`,
              lineHeight: `dense`,
              top: `auto`,
            }}
          >
            {a11yLabel}
          </Box>
        )}

        <CopyToClipboard text={this.state.value} onCopy={this.toggleCopied}>
          <button
            className="btn-copy"
            sx={{
              background: `none`,
              border: 0,
              bottom: 0,
              color: `black`,
              cursor: `pointer`,
              height: `100%`,
              left: 0,
              position: `absolute`,
              right: 0,
              top: 0,
              width: `100%`,
              zIndex: 1,
              ":focus .tooltip, :hover .tooltip": {
                display: `block`,
              },
            }}
            aria-label={color.hex}
            onClick={this.handleClick}
          >
            <Box
              bg="white"
              boxShadow="raised"
              borderRadius={1}
              fontSize={1}
              className="tooltip"
              sx={{
                top: `-40px`,
                height: `32px`,
                left: 0,
                lineHeight: `32px`,
                display: `none`,
                position: `absolute`,
                width: `160px`,
              }}
            >
              {this.state.displayCopied ? (
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
            bg={textColor}
            borderRadius={7}
            bottom={4}
            fontSize={0}
            lineHeight="solid"
            height={8}
            width={8}
            position="absolute"
            top="auto"
            right={4}
            css={{
              bottom: 4,
              right: 4,
            }}
          />
        )}
      </Box>
    )
  }
}
