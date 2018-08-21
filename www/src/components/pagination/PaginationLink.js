import React from 'react'
import { Link } from 'gatsby'

const PaginationLink = props => {
  if (props.to) {
    return <Link to={props.to}>{props.children}</Link>
  }
  return <span>{props.children}</span>
}

export default PaginationLink