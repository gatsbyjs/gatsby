React = require 'react'
Demo = require './_Demo'
DocumentTitle = require 'react-document-title'

module.exports = React.createClass

  statics:
    metadata: ->
      order: 4
      title: "Some React Code"

  render: ->
    <DocumentTitle title={module.exports.metadata().title + " | AlphabetJS"}>
      <div>
        <h1>Some React Code</h1>
        <p>
          It's easy to intermix different file types. The other documentation pages
          are all written in Markdown but this page is a normal React.js component.
          Gatsby has built-in support for Markdown, HTML, JSX, and CJSX (Coffeescript flavored JSX)
          but it's easy to add support for additional file formats.
        </p>
        <p>
          React.js component pages makes it easy to add interactivity or ajax enhancements
          to what is otherwise a static site. In the case of a documentation site,
          it let's you embed sample/runnable code to illustrate your documentation.
          (This demo is from <a href="https://github.com/chenglou/react-motion">React Motion</a>).
        </p>
        <div
          style={{
            height: 500
          }}
        >
          <Demo/>
        </div>
      </div>
    </DocumentTitle>
