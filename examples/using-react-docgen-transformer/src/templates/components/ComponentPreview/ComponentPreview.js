import React from "react"
import PropTypes from "prop-types"
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live"

import Button from "../../../components/Button"

class ComponentPreview extends React.Component {
  render() {
    return (
      <LiveProvider scope={{ Button }} code={this.props.code}>
        <LiveEditor />
        <LiveError />
        <LivePreview />
      </LiveProvider>
    )
  }
}

ComponentPreview.propTypes = {
  code: PropTypes.string.isRequired,
}

export default ComponentPreview
