# gatsby-plugin-styletron

A [Gatsby](https://github.com/gatsbyjs/gatsby) plugin for
[styletron](https://github.com/rtsao/styletron) with built-in server-side
rendering support.

## Install

`npm install --dev gatsby-plugin-styletron`

## How to use

Edit `gatsby-config.js`

```javascript
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-styletron",
      options: {
        // You can pass options to Styletron.
        prefix: "_",
      },
    },
  ],
};
```

This can be used as described by [styletron-react](https://github.com/rtsao/styletron/tree/master/packages/styletron-react) such as:

```javascript
import React from "react";
import { styled, withStyle } from "styletron-react";

const RedAnchor = styled("a", { color: "red" });
const FancyAnchor = withStyle(RedAnchor, { fontFamily: "cursive" });

export default () => <FancyAnchor>Hi!</FancyAnchor>;
```

Or, using the `css` convenience function:

```javascript
import React from "react";
import styletron from "gatsby-plugin-styletron";

const styles = {
  fontFamily: "cursive",
  color: "blue",
};

export default props => {
  const css = styletron().css;
  return <div className={css({ backgroundColor: "#fcc", ...styles })}>Hi!</div>;
};
```

Or, crazy flexible combinations:

```javascript
import React from "react";
import { styled, withStyle } from "styletron-react";
import styletron from "gatsby-plugin-styletron";

const fancyStyles = {
  ":hover": {
    backgroundColor: "papayawhip",
  },
  "@media (max-width: 768px)": {
    ":hover": {
      animationDuration: "3s",
      animationFillMode: "forwards",
      animationName: {
        "0%": {
          transform: "translate3d(0,0,0)",
        },
        to: {
          transform: "translate3d(100%,0,0)",
        },
      },
      willChange: "transform",
    },
    fontFamily: {
      fontStyle: "normal",
      fontWeight: "normal",
      src:
        "url(https://fonts.gstatic.com/s/inconsolata/v16/QldKNThLqRwH-OJ1UHjlKGlW5qhExfHwNJU.woff2) format(woff2)",
    },
    fontSize: "24px",
  },
  fontSize: "36px",
};

const divStyles = {
  border: "1px dashed #333",
};

const RedAnchor = styled("a", { color: "red" });
const FancyAnchor = withStyle(RedAnchor, { fontFamily: "cursive" });

export default () => {
  const css = styletron().css;

  return (
    <div
      className={css({ backgroundColor: "#cff", ...divStyles, ...fancyStyles })}
    >
      <FancyAnchor>Hi!</FancyAnchor>
      <div className={css(fancyStyles)}>Cool huh?</div>
    </div>
  );
};
```
