# gatsby-plugin-styletron

A [Gatsby](https://github.com/gatsbyjs/gatsby) plugin for
[styletron](https://github.com/styletron/styletron) with built-in server-side
rendering support.

**This plugin supports `styletron-react` v5.** Check [the release notes](https://github.com/styletron/styletron/releases/tag/styletron-react%405.0.0) for more details about v5.

## Install

```shell
npm install gatsby-plugin-styletron styletron-react styletron-engine-atomic
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
        // Disable dev debug mode, enabled by default
        debug: false,
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
