gatsby-plugin-styled-components
-----------------------

A [gatsby](https://github.com/gatsbyjs/gatsby) plugin for [styled-components](https://github.com/styled-components/styled-components) with server-sider rendering support.

## Install

`npm install --dev gatsby-plugin-styled-components`

## How to use

edit `gatsby-config.js`

```javascript
plugins: [
  `gatsby-plugin-styled-components`,
]
```

edit `src/html.js`

```html
module.exports = class extends React.Component {
  render() {
    return (
      <html lang="en">
        <head>
          {this.props.styles}
        </head>
        <body>
          <div id="___gatsby" dangerouslySetInnerHTML={{ __html: this.props.body }} />
        </body>
      </html>
    )
  }
}
```

## Copyright

MIT
