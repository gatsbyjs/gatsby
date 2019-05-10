# gatsby-plugin-styletron

A [Gatsby](https://github.com/gatsbyjs/gatsby) plugin for
[styletron](https://github.com/styletron/styletron) with built-in server-side
rendering support.

## Install

```sh
npm install gatsby-plugin-styletron
```

## How to use

Edit `gatsby-config.js`

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-styletron`,
      options: {
        // You can pass options to Styletron.
        prefix: "_",
      },
    },
  ],
}
```

This can be used as described by [styletron-react](https://github.com/styletron/styletron/tree/master/packages/styletron-react) such as:

```jsx
import React from "react"
import { styled, useStyletron } from "styletron-react"

// statically styled component
const RedAnchor = styled("a", { color: "red" })

// dynamically styled component
const BigAnchor = styled("a", ({ $size }) => ({ fontSize: `${$size}px` }))

const IndexPage = () => {
  // an alternative hook based API
  const [css] = useStyletron()
  return (
    <div>
      <RedAnchor>Red Anchor</RedAnchor>
      <BigAnchor $size={64}>Big Anchor</BigAnchor>
      <p className={css({ color: "blue" })}>blue text</p>
    </div>
  )
}
```

Check more documentation and examples at [styletron.org](https://www.styletron.org/).
