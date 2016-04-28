import React from 'react'

export default function template (props) {
  return <div>{props.children}</div>
}

template.propTypes = { children: React.PropTypes.any }
