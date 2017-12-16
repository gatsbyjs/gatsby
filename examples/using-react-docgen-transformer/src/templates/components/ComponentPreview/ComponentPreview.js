import React from "react"
import PropTypes from "prop-types"
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live"

import * as components from "../../../../.cache/components"

class ComponentPreview extends React.Component {
  render() {
    return (
      <LiveProvider scope={components} code={this.props.code}>
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
