import React from "react"
import PropTypes from "prop-types"
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live"

import * as components from "../../../../../.cache/components"

import "./prism-theme.css"
import "./editor.css"

const editorStyles = {
  backgroundColor: `#f2f2f2`,
  boxSizing: `border-box`,
}

class ComponentPreview extends React.Component {
  render() {
    return (
      <LiveProvider
        scope={components}
        code={this.props.code}
        mountStylesheet={false}
      >
        <LiveEditor style={editorStyles} />
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
