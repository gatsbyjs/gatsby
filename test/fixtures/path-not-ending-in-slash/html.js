import React from 'react'

export default function html (props) {
  return (
    <html>
      <head>
      </head>
      <body>
        <div id="react-mount" dangerouslySetInnerHTML={{ __html: props.body }} />
      </body>
    </html>
  )
}

html.propTypes = {
  body: React.PropTypes.string,
}
