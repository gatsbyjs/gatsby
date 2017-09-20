import React, { Component } from 'react'

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
        case `N/A`: {
          return `none`
        }
      }
      return null
    }
    const basicStyling = {
      width: `30px`,
      height: `30px`,
      display: `block`,
      borderRadius: `50%`,
      border: `1px solid #9d7cbf`,
      float: `left`,
      margin: `6px`,
    }
    return (
      <div
        style={{
          ...basicStyling,
          "verticalAlign": "middle",
          textAlign: `middle`,
          backgroundColor: this.props.num === `0` ? `#dddddd` : `#9d7cbf`,
          backgroundImage: getBackground(this.props.num),
        }}
      >
      </div>
    )
  }
}

export default EvaluationCell