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
        css={{
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
            fontWeight={0}
            css={{
              bottom: 2,
              left: 3,
              lineHeight: 1,
              top: `auto`,
            }}
          >
            {a11yLabel}
          </Box>
        )}

        <CopyToClipboard text={this.state.value} onCopy={this.toggleCopied}>
          <button
            className="btn-copy"
            css={{
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
              css={{
                top: -40,
                height: 32,
                left: 0,
                lineHeight: `32px`,
                display: `none`,
                position: `absolute`,
                width: 160,
              }}
            >
              {this.state.displayCopied ? (
                <>Copied to clipboard!</>
              ) : (
                <>
                  Copy HEX <code>{color.hex}</code>
                </>
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
