---
title: Emotion
---

In this guide, you will learn how to set up a site with the CSS-in-JS library [Emotion](https://emotion.sh).

Emotion is a performant and flexible CSS-in-JS library. Building on many other CSS-in-JS libraries, it allows you to style apps quickly with string or object styles. It has predictable composition to avoid specificity issues with CSS. With source maps and labels, Emotion has a great developer experience and great performance with heavy caching in production.

[Server side rendering](https://emotion.sh/docs/ssr) works out of the box in Emotion. You can use React’s `renderToString` or `renderToNodeStream` methods directly without any extra configuration. `extractCritical` feature removes unused rules that were created with emotion and helps loading pages faster.

First, open a new terminal window and run the following to create a new site:

```shell
gatsby new emotion-tutorial https://github.com/gatsbyjs/gatsby-starter-hello-world
```

Second, install the necessary dependencies for Emotion and Gatsby.

```shell
npm install gatsby-plugin-emotion @emotion/react @emotion/styled
```

And then add the plugin to your site's `gatsby-config.js`:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [`gatsby-plugin-emotion`],
}
```

Then in your terminal run `npm start` to start the Gatsby development server.

Now create a sample Emotion page at `src/pages/index.js`:

```jsx:title=src/pages/index.js
import React from "react"
import styled from "@emotion/styled"
import { css } from "@emotion/react"

const Container = styled.div`
  margin: 3rem auto;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const UserWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0;
  margin-right: auto;
  margin-bottom: 12px;
  margin-left: auto;
  &:last-child {
    margin-bottom: 0;
  }
`

const Avatar = styled.img`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 96px;
  width: 96px;
  height: 96px;
  margin: 0;
`

const Description = styled.div`
  flex: 1;
  margin-left: 18px;
  padding: 12px;
`

const Username = styled.h2`
  margin: 0 0 12px 0;
  padding: 0;
`

const Excerpt = styled.p`
  margin: 0;
`
// Using css prop provides a concise and flexible API to style the components. //
const underline = css`
  text-decoration: underline;
`

const User = props => (
  <UserWrapper>
    <Avatar src={props.avatar} alt="" />
    <Description>
      <Username>{props.username}</Username>
      <Excerpt>{props.excerpt}</Excerpt>
    </Description>
  </UserWrapper>
)

export default function UsersList() {
  return (
    <Container>
      <h1 css={underline}>About Emotion</h1>
      <p>Emotion is uber cool</p>
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
  )
}
```

## Adding global styles in Gatsby with Emotion

To start, create a new Gatsby site with the [hello world starter](https://github.com/gatsbyjs/gatsby-starter-hello-world) and install [`gatsby-plugin-emotion`](/plugins/gatsby-plugin-emotion/) and its dependencies:

```shell
gatsby new global-styles https://github.com/gatsbyjs/gatsby-starter-hello-world
cd global-styles
npm install gatsby-plugin-emotion @emotion/react @emotion/styled
```

Create `gatsby-config.js` and add the Emotion plugin:

```js:title=gatsby-config.js
module.exports = {
  plugins: [`gatsby-plugin-emotion`],
}
```

Next, add a layout component at `src/components/layout.js`:

```jsx:title=src/components/layout.js
import React from "react"
import { Global, css } from "@emotion/react"
import styled from "@emotion/styled"

const Wrapper = styled("div")`
  border: 2px solid green;
  padding: 10px;
`

export default function Layout({ children }) {
  return (
    <Wrapper>
      <Global
        styles={css`
          div {
            background: red;
            color: white;
          }
        `}
      />
      {children}
    </Wrapper>
  )
}
```

Then, update `src/pages/index.js` to use the layout:

```jsx:title=src/pages/index.js
import React from "react"
import Layout from "../components/layout"

export default function Home() {
  return <Layout>Hello world!</Layout>
}
```

Run `npm run build`, and you can see in `public/index.html` that the styles have been inlined globally.
