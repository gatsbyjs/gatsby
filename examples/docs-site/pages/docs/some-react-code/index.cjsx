React = require 'react'
Demo = require './_Demo'

module.exports = React.createClass

  statics:
    metadata: ->
      order: 4
      title: "Some React Code"

  render: ->
    <div>
      <h1>Some React Code</h1>
      <p>
        It's easy to intermix different file types. The other documentation pages
        are all written in Markdown but this page is a normal React.js component.
      </p>
      <p>
        Which makes it easy to embed sample/runnable code to illustrate your documentation.
      </p>
      <div
        style={{
          height: 500
        }}
      >
        <Demo/>
      </div>
    </div>
