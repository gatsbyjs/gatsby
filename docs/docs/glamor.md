---
title: Glamor
---

In this guide, we'll walk through setting up a site with the CSS-in-JS library [Glamor](https://github.com/threepointone/glamor).

Glamor lets you write _real_ CSS inline in your components using the same Object
CSS syntax React supports for the `style` prop. Glamor is a variant on "CSS-in-JS"—which solves many of the problems with traditional CSS.

One of the most important problems they solve is selector name collisions. With traditional CSS, you have to be careful not to overwrite CSS selectors used elsewhere in a site because all CSS selectors live in the same global namespace. This unfortunate restriction can lead to elaborate (and often confusing) selector naming schemes.

With CSS-in-JS, you avoid all that as CSS selectors are scoped automatically to their component. Styles are tightly coupled with their components. This makes it easier to know how to edit a component's CSS as there's never any confusion about how and where CSS is being used.

First, open a new terminal window and run the following to create a new site:

```shell
gatsby new glamor-tutorial https://github.com/gatsbyjs/gatsby-starter-hello-world
```

Second, install the Gatsby plugin for Glamor.

```shell
npm install --save gatsby-plugin-glamor
```

And then add it to your site's `gatsby-config.js`:

```javascript
module.exports = {
  plugins: [`gatsby-plugin-glamor`],
};
```

Then in your terminal run `gatsby develop` to start the Gatsby development server.

Now let's create a sample Glamor page at `src/pages/index.js`

```jsx
import React from "react";

const Container = ({ children }) => (
  <div>{children}</div>
);

export default () => (
  <Container>
    <h1>About Glamor</h1>
    <p>Glamor is cool</p>
  </Container>
);
```

Let's add css styles to `Container` and add a inline `User` component using Glamor's `css` prop.

```jsx{4,7-29,35-42}
import React from "react"

const Container = ({ children }) => (
  <div css={{ margin: `3rem auto`, maxWidth: 600 }}>{children}</div>
);

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

### Final result

![glamor page](../tutorial/part-two/glamor-example.png)
