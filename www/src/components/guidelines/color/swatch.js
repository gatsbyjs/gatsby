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
    const { accessibilityLabel, color, swatchStyle, textColor } = this.props

    return (
      <Box
        borderRadius={1}
        bg={color.hex}
        css={{
          ...swatchStyle,
          ":hover > .btn-copy": {
            display: `block`,
          },
        }}
      >
        {accessibilityLabel !== `×` && (
          <Box
            color={textColor}
            fontSize={0}
            position="absolute"
            fontWeight={0}
            css={{
              lineHeight: 1,
              bottom: 2,
              top: `auto`,
              left: 3,
            }}
          >
            {accessibilityLabel}
          </Box>
        )}

        <CopyToClipboard text={this.state.value} onCopy={this.toggleCopied}>
          <button
            className="btn-copy"
            tabIndex="0"
            css={{
              border: 0,
              display: `none`,
              background: `none`,
              color: `black`,
              cursor: `pointer`,
              position: `absolute`,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: 40,
              height: 20,
              zIndex: 1,
            }}
            onClick={this.handleClick}
          >
            {this.state.displayCopied ? `HEX Copied!` : `Copy HEX`}
          </button>
        </CopyToClipboard>

        {(color.name || color.base) && (
          <Box
            fontSize={0}
            bg={textColor}
            borderRadius={7}
            lineHeight="solid"
            height={8}
            width={8}
            position="absolute"
            top="auto"
            bottom={4}
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
