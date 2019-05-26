// stolen from https://nick.vanexan.ca 🙏
// adjusted to measure the svg path length, make colors configurable

import React from "react"
import { Spring } from "react-spring/renderprops"
import Highlighter from "./highlighter"
import styled from "@emotion/styled-base"
import VisibilitySensor from "react-visibility-sensor"

const Container = styled(`span`)`
  font-style: normal;
  position: relative;
  z-index: 1;
  white-space: nowrap;
`

class Annotation extends React.PureComponent {
  constructor(props) {
    super(props)
    this.handleLengthChange = this.handleLengthChange.bind(this)
    this.state = { visible: false, length: false }
  }

  onChangeVisibility = isActive => {
    this.setState({ active: isActive })
  }

  handleLengthChange(length) {
    if (length > 100) {
      this.setState({ length: length * 2 })
    } else {
      this.setState({ length: 100 * 2 })
    }
  }

  render() {
    const { delay, type, children, immediate, reset, color } = this.props
    const length = this.state.length

    return (
      <VisibilitySensor
        onChange={this.onChangeVisibility}
        active={!this.state.active}
      >
        {({ isVisible }) => (
          <Container>
            {children}

            {!length ? (
              <Highlighter
                type={type}
                x={10000}
                dashArray={10000}
                color={color}
                getLength={this.handleLengthChange}
              />
            ) : null}

            {isVisible && length ? (
              <Spring
                from={{ x: length }}
                to={{ x: 0 }}
                config={{ duration: Math.pow(length, 0.4) * 55 }}
                delay={delay || 500}
                reset={reset || false}
                immediate={immediate || false}
              >
                {props => (
                  <Highlighter
                    type={type}
                    x={props.x}
                    dashArray={length}
                    color={color}
                    getLength={this.handleLengthChange}
                  />
                )}
              </Spring>
            ) : null}
          </Container>
        )}
      </VisibilitySensor>
    )
  }
}

export default Annotation
