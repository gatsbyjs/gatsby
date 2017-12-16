import React from "react"
import PropTypes from "prop-types"
import { Parser, ProcessNodeDefinitions } from "html-to-react"

const isValidNode = () => true
const isCodeExample = ({ name = `` } = {}) => name === `pre`

const parser = new Parser()
const processNodeDefinitions = new ProcessNodeDefinitions(React)

const processingInstructions = [
  {
    shouldProcessNode: isCodeExample,
    processNode: (node, children) => {
      console.log(node)
      return processNodeDefinitions.processDefaultNode(node, children)
    },
  },
  {
    shouldProcessNode: isValidNode,
    processNode: processNodeDefinitions.processDefaultNode,
  },
]

class Example extends React.Component {
  render() {
    const html = parser.parseWithInstructions(
      this.props.html,
      isValidNode,
      processingInstructions
    )
    console.log(html)
    return <div>{html}</div>
  }
}

Example.propTypes = {
  html: PropTypes.string.isRequired,
}

export default Example
