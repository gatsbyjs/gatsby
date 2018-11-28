import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"

const PullquoteRoot = styled(`blockquote`)`
  background: gray;
  border: 0;
  padding: 1em;

  /* override typography.js style "p *:last-child {"" */
  p > & {
    margin: 2rem 0;
  }
`

const Pullquote = ({ children }) => <PullquoteRoot>{children}</PullquoteRoot>

Pullquote.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Pullquote
