React = require 'react'
Typography = require 'typography'
DocumentTitle = require 'react-document-title'

typography = new Typography({
  baseFontSize: '15px'
  baseLineHeight: '22.5px'
  bodyFontFamily: '"Helvetica Neue", "Segoe UI", Helvetica, Arial, sans-serif'
  headerFontFamily: '"Helvetica Neue", "Segoe UI", Helvetica, Arial, sans-serif'
  bodyWeight: 300
  headerWeight: 600
  boldWeight: 600
  modularScales: [
    'minor third'
  ]
})
{TypographyStyle} = typography

module.exports = React.createClass
  getDefaultProps: ->
    body: ""

  render: ->
    title = DocumentTitle.rewind()
    if @props.title then title = @props.title

    <html lang="en">
      <head>
        <meta charSet="utf-8"/>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
        <meta name='viewport' content='user-scalable=no width=device-width, initial-scale=1.0 maximum-scale=1.0'/>
        <title>{title}</title>
        <link rel="shortcut icon" href={@props.favicon}/>
        <TypographyStyle/>
        <style dangerouslySetInnerHTML={{__html: """
          a {
            color: #884499;
          }
          pre {
            background: whitesmoke;
            padding: 1.5rem;
          }
          .demo1-ball {
            border-radius: 99px;
            background-color: white;
            width: 50px;
            height: 50px;
            border: 3px solid white;
            position: absolute;
            background-size: 50px;
          }
          .ball-0 {
            background-image: url(/docs/some-react-code/0.jpg);
          }
          .ball-1 {
            background-image: url(/docs/some-react-code/1.jpg);
          }
          .ball-2 {
            background-image: url(/docs/some-react-code/2.jpg);
          }
          .ball-3 {
            background-image: url(/docs/some-react-code/3.jpg);
          }
          .ball-4 {
            background-image: url(/docs/some-react-code/4.jpg);
          }
          .ball-5 {
            background-image: url(/docs/some-react-code/5.jpg);
          }
        """}}
        />
      </head>
      <body className="landing-page">
        <div id="react-mount" dangerouslySetInnerHTML={{__html: @props.body}} />
        <script src="/bundle.js"/>
      </body>
    </html>
