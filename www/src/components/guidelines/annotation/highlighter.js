import React from "react"
import styled from "@emotion/styled-base"
import { style } from "styled-system"

const Container = styled(`span`)`
  position: absolute;
  width: 100%;
  left: 50%;
  top: 50%;
  z-index: -1;
  transform: translate(-50%, -50%);
`

const HighlightContainer = styled(Container)`
  top: 70%;
`

const UnderlineContainer = styled(Container)`
  top: 80%;
`

const CircleContainer = styled(Container)`
  top: 60%;
  width: 105%;
`

const stroke = style({
  prop: `stroke`,
  key: `colors`,
})

const Path = styled(`path`)`
  ${stroke}
`
Path.defaultProps = {
  stroke: `yellow.50`,
}

class Underline extends React.PureComponent {
  setLength = element => {
    if (element) {
      this.props.getLength(parseInt(element.getBoundingClientRect().width, 10))
    }
  }

  render() {
    const { x, dashArray, color } = this.props

    return (
      <UnderlineContainer>
        <svg
          viewBox="0 0 100 10"
          width="100%"
          height="8px"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="svg"
        >
          <Path
            d="M 0,5 L 100,5"
            fillRule="nonzero"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={dashArray}
            strokeDashoffset={x}
            vectorEffect="non-scaling-stroke"
            ref={this.setLength}
          />
        </svg>
      </UnderlineContainer>
    )
  }
}

class Highlight extends React.PureComponent {
  setLength = element => {
    if (element) {
      this.props.getLength(parseInt(element.getBoundingClientRect().width, 10))
    }
  }

  render() {
    const { x, dashArray, color } = this.props

    return (
      <HighlightContainer>
        <svg
          viewBox="0 0 317 37"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="svg"
          width="100%"
          height="1em"
          style={{ overflow: `visible` }}
        >
          <Path
            d="M15.563 17.85c34.191-6.285 86.213 1.473 120.639 2.625 13.916.466 27.868-.168 41.798 0 14.418.174 28.834 1.544 43.234 1.025 195.96-7.052-73.065-2.706 80.047-4.665"
            fillRule="nonzero"
            stroke={color}
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={dashArray}
            strokeDashoffset={x}
            vectorEffect="non-scaling-stroke"
            ref={this.setLength}
          />
        </svg>
      </HighlightContainer>
    )
  }
}

class Circle extends React.PureComponent {
  setLength = element => {
    if (element) {
      this.props.getLength(parseInt(element.getTotalLength(), 10))
    }
  }

  render() {
    const { x, dashArray, color } = this.props

    return (
      <CircleContainer>
        <svg
          viewBox="0 0 581 140"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: `visible` }}
        >
          <Path
            d="M249.087 22.081c-40.75 1.423-82.808-9.414-123.368-2.798-30.868 5.036-61.295 12.563-91.647 20.11C14.91 44.156 8.746 69.325 25.065 81.67c19.333 14.623 44.577 22.585 67.632 27.895 25.797 5.941 51.924 10.377 78.022 14.813 84.437 14.355 189.816 14.753 274.808 6.511 34.506-3.346 90.743-9.183 117.478-32.913 35.047-31.106-2.137-40.098-35.57-51.09-29.501-9.7-106.973-27.524-129.377-31.152C307.893 1.13 182.488-2.794 96.42 17.969 63.924 25.81 27.363 49.53 1.87 62.753"
            fillRule="nonzero"
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={dashArray}
            strokeDashoffset={x}
            vectorEffect="non-scaling-stroke"
            ref={this.setLength}
          />
        </svg>
      </CircleContainer>
    )
  }
}

const Highlighter = ({ color, dashArray, getLength, type, x }) => {
  switch (type) {
    case `line`:
      return (
        <Underline
          color={color}
          dashArray={dashArray}
          getLength={getLength}
          x={x}
        />
      )
    case `circle`:
      return (
        <Circle
          color={color}
          dashArray={dashArray}
          getLength={getLength}
          x={x}
        />
      )
    default:
      return (
        <Highlight
          color={color}
          dashArray={dashArray}
          getLength={getLength}
          x={x}
        />
      )
  }
}

export default Highlighter
