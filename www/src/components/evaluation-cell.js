import React, { Component } from 'react'
import { rhythm } from "../utils/typography"
import presets from "../utils/presets"

class EvaluationCell extends Component {
  render() {
    const getBackground = num => {
      switch (num){
        case `3`: {
          return `none`
        }
        case `2`: {
          return `linear-gradient(90deg, transparent 50%, #dddddd 50%)`
        }
        case `1`: {
          return `linear-gradient(180deg, transparent 50%, #dddddd 50%), linear-gradient(90deg, transparent 50%, #dddddd 50%)`
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
      display: `block`,
      borderRadius: `50%`,
      border: `1px solid #9d7cbf`,
      [presets.Mobile]: {
        height: rhythm(1),
        width: rhythm(1),
      },
    }
    return (
      <div
        css={{
          ...basicStyling,
          "verticalAlign": `middle`,
          backgroundColor: (
            [`N/A`, `0`, ``].indexOf(this.props.num) !== -1 ?
              `#dddddd` :
              `#9d7cbf`
          ),
          backgroundImage: getBackground(this.props.num),
          ...(this.props.style || {}),
        }}
      >
      </div>
    )
  }
}

export default EvaluationCell