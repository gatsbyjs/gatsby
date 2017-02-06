# gatsby-inline-css

React component for inlining a site's CSS in the site's `<head>`.

## Install

`npm install --save gatsby-inline-css`

## Why inline CSS
Inlining CSS in your head avoids an extra (blocking) HTTP request when
loading your page dramatically speeding up the initial load of your
site.

## How to use

```javascript
// In your site's html.js
const InlineCSS = require('gatsby-inline-css')

render () {
  return (
    <html lang="en">
      <head>
        {this.props.headComponents}
        <title>Gatsby Site</title>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <InlineCSS />
      </head>
      <body>
        <div id="react-mount" dangerouslySetInnerHTML={{ __html: this.props.body }} />
        {this.props.postBodyComponents}
      </body>
    </html>
  )
}
```
