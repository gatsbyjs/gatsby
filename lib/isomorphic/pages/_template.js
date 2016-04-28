import React, { PropTypes } from 'react'

// FIXME link to a tutorial/guide/docs/something
const defaultMessage = `
Gatsby is currently using the default _template. You can override it by
creating a React component at "/pages/_template.js".
`
console.info(defaultMessage)

export default function template (props) {
  return <div>{props.children}</div>
}

template.propTypes = { children: PropTypes.any }
