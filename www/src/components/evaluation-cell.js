import React, { Component } from "react"
import { rhythm } from "../utils/typography"
import presets, { colors } from "../utils/presets"

class EvaluationCell extends Component {
  render() {
    const bgDefault = `#edebf0`
    const bgFeatureAvailability = colors.accent

    const getBackground = num => {
      switch (num) {
        case `3`: {
          return `none`
        }
        case `2`: {
          return `linear-gradient(90deg, transparent 50%, ${bgDefault} 50%)`
        }
        case `1`: {
          return `linear-gradient(180deg, transparent 50%, ${bgDefault} 50%), linear-gradient(90deg, transparent 50%, ${bgDefault} 50%)`
        }
        case `0`: {
          return `none`
        }
        case ``:
        case `N/A`: {
          return `none`
        }
      }
      return `none`
    }
    const basicStyling = {
      height: rhythm(3 / 4),
      width: rhythm(3 / 4),
      borderRadius: `50%`,
      margin: `0 auto`,
      [presets.Mobile]: {
        height: rhythm(0.875),
        width: rhythm(0.875),
      },
    }
    return (
      <div
        css={{
          ...basicStyling,
          backgroundColor:
            [`N/A`, `0`, ``].indexOf(this.props.num) !== -1
              ? bgDefault
              : bgFeatureAvailability,
          backgroundImage: getBackground(this.props.num),
          ...(this.props.style || {}),
        }}
      />
    )
  }
}

export default EvaluationCell
