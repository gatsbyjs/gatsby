---
title: Glamor
---

Let's create a page using
[Glamor](https://github.com/threepointone/glamor). It might be useful for you to explore [CSS Modules](/tutorial/part-two/#css-modules) and [Styled Components](../styled-components/) to see how Glamor compares as a styling method.

Glamor lets you write _real_ CSS inline in your components using the same Object
CSS syntax React supports for the `style` prop. Glamor is a variant on "CSS-in-JS"—which solves many of the problems with traditional CSS.

One of the most important problems they solve is selector name collisions. With traditional CSS, you have to be careful not to overwrite CSS selectors used elsewhere in a site because all CSS selectors live in the same global namespace. This unfortunate restriction can lead to elaborate (and often confusing) selector naming schemes.

With CSS-in-JS, you avoid all that as CSS selectors are scoped automatically to their component. Styles are tightly coupled with their components. This makes it very easy to know how to edit a component's CSS as there's never any confusion about how and where CSS is being used.

First, install the Gatsby plugin for Glamor.

```shell
npm install --save gatsby-plugin-glamor
```

And then add it to your `gatsby-config.js`

```javascript{9}
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography.js`,
      },
    },
    `gatsby-plugin-glamor`,
  ],
}
```

Restart `gatsby develop` again to enable the Glamor plugin.

Now create the Glamor page at `src/pages/about-glamor.js`

```jsx
import React from "react";

import Container from "../components/container";

export default () => (
  <Container>
    <h1>About Glamor</h1>
    <p>Glamor is cool</p>
  </Container>
);
```

Let's add the same inline `User` component that you would use for CSS Modules, but this time using Glamor's `css`
prop.

```jsx{5-27,33-40}
import React from "react"

import Container from "../components/container"

const User = props =>
  <div
    css={{
      display: `flex`,
      alignItems: `center`,
      margin: `0 auto 12px auto`,
      "&:last-child": { marginBottom: 0 }
    }}
  >
    <img
      src={props.avatar}
      css={{ flex: `0 0 96px`, width: 96, height: 96, margin: 0 }}
      alt=""
    />
    <div css={{ flex: 1, marginLeft: 18, padding: 12 }}>
      <h2 css={{ margin: `0 0 12px 0`, padding: 0 }}>
        {props.username}
      </h2>
      <p css={{ margin: 0 }}>
        {props.excerpt}
      </p>
    </div>
  </div>

export default () =>
  <Container>
    <h1>About Glamor</h1>
    <p>Glamor is cool</p>
    <User
      username="Jane Doe"
      avatar="https://s3.amazonaws.com/uifaces/faces/twitter/adellecharles/128.jpg"
      excerpt="I'm Jane Doe. Lorem ipsum dolor sit amet, consectetur adipisicing elit."
    />
    <User
      username="Bob Smith"
      avatar="https://s3.amazonaws.com/uifaces/faces/twitter/vladarbatov/128.jpg"
      excerpt="I'm Bob smith, a vertically aligned type of guy. Lorem ipsum dolor sit amet, consectetur adipisicing elit."
    />
  </Container>
```

If you are using Glamor in Part Two of the tutorials, the final Glamor page should look identical to the CSS Modules page.

![glamor-example](glamor-example.png)
