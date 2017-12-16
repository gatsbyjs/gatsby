import React from "react"
import PropTypes from "prop-types"
import { Parser } from "html-to-react"
import _ from "lodash"

const parser = new Parser()

class Example extends React.Component {
  render() {
    const html = _.filter(parser.parse(this.props.html), _.isObject)
    return <div>{html}</div>
  }
}

Example.propTypes = {
  html: PropTypes.string.isRequired,
}

export default Example
