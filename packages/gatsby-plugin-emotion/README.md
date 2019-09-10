# gatsby-plugin-emotion

Provide support for using the css-in-js library
[Emotion](https://github.com/emotion-js/emotion) including server side
rendering.

**This plugin supports Emotion v10+**

Older versions should use versions of this plugin which support Emotion 8 and 9. Check out the Emotion 10 [migration
guide](https://emotion.sh/docs/migrating-to-emotion-10#incremental-migration) for more information on how to upgrade.

## What this plugin does

This plugin lets you leverage Emotion's server-side rendering (SSR) on the following Emotion APIs:

- `css` React component prop from `@emotion/core` with the `jsx` babel transformation:

```jsx
import { css } from "@emotion/core"

const Header = () => (
  <h2
    css={css`
      color: hotpink;
    `}
  >
    Welcome
  </h2>
)
```

- `styled` function with `@emotion/styled`:

```jsx
import styled from "@emotion/styled"

const Header = styled.h2`
  color: hotpink;
`
```

**Note**: Unlike the APIs mentioned above, the `css` function from `emotion` **will not render styles via SSR with this plugin**. The styles defined with this function will be rendered on the client instead:

```jsx
import { css } from "emotion"

const Header = () => (
  <h2
    className={css`
      color: hotpink;
    `} /* ❌ : SSR not working, will be rendered on client instead  */
  >
    Welcome
  </h2>
)
```

## Install

```
npm install --save gatsby-plugin-emotion @emotion/core @emotion/styled
```

## How to use

Add the plugin to your `gatsby-config.js`.

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-emotion`,
      options: {
        // Accepts all options defined by `babel-plugin-emotion` plugin.
      },
    },
  ],
}
```
