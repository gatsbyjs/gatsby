import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"

const PullquoteRoot = styled(`blockquote`)`
  background: gray;
  border: 0;
  margin: 2rem 0 3rem;
  padding: 1em;

  p > & {
    margin: 2rem 0;
  }
`

const Pullquote = ({ children }) => <PullquoteRoot>{children}</PullquoteRoot>

Pullquote.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Pullquote
