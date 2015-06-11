React = require 'react'
{Container, Grid, Breakpoint, Span} = require 'react-responsive-grid'
Markdown = require 'react-remarkable'

module.exports = React.createClass
  displayName: "MarkdownWrapper"

  render: ->
    {rhythm} = @props.typography
    post = @props.page.data

    <Container
      style={{
        maxWidth: rhythm(30)
        padding: "#{rhythm(2)} #{rhythm(1)}"
      }}
    >
      <h2>{post.title}</h2>
      <Markdown
        options={{
          html: true
          linkify: true
          typographer: true
        }}
      >
        {post.body}
      </Markdown>
    </Container>
