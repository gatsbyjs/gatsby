---
title: Styled Components
---

[Styled Components](https://www.styled-components.com/) is an example of using CSS-in-JS. It might be useful for you to explore [CSS Modules](/tutorial/part-two/) and [Glamor](/glamor/) to see how Styled Components compares as a styling method.

Styled Components lets you use actual CSS syntax inside your components. Like Glamor, Styled Components is a variant on "CSS-in-JS"—which solves many of the problems with traditional CSS.

One of the most important problems they solve is selector name collisions. With traditional CSS, you have to be careful not to overwrite CSS selectors used elsewhere in a site because all CSS selectors live in the same global namespace. This unfortunate restriction can lead to elaborate (and often confusing) selector naming schemes.

With CSS-in-JS, you avoid all that as CSS selectors are scoped automatically to their component. Styles are tightly coupled with their components. This makes it very easy to know how to edit a component's CSS as there's never any confusion about how and where CSS is being used.

First, we'll install the Gatsby plugin for Styled Components.

```sh
npm install --save gatsby-plugin-styled-components styled-components
```

Then modify the `gatsby-config.js`. If you've previously used the Glamor plugin in this site,
you'll need to remove the Glamor plugin and delete the Glamor component page we
created. The two plugins conflict with each other as both want to take control
during server rendering.

```javascript{9}
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography.js`,
      },
    },
    `gatsby-plugin-styled-components`,
  ],
}
```

Then at `src/pages/about-styled-components.js` create:

```jsx
import React from "react";
import styled from "styled-components";

import Container from "../components/container";

const UserWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 0 auto 12px auto;
  &:last-child {
    margin-bottom: 0;
  }
`;

const Avatar = styled.img`
  flex: 0 0 96px;
  width: 96px;
  height: 96px;
  margin: 0;
`;

const Description = styled.div`
  flex: 1;
  margin-left: 18px;
  padding: 12px;
`;

const Username = styled.h2`
  margin: 0 0 12px 0;
  padding: 0;
`;

const Excerpt = styled.p`
  margin: 0;
`;

const User = props => (
  <UserWrapper>
    <Avatar src={props.avatar} alt="" />
    <Description>
      <Username>{props.username}</Username>
      <Excerpt>{props.excerpt}</Excerpt>
    </Description>
  </UserWrapper>
);

export default () => (
  <Container>
    <h1>About Styled Components</h1>
    <p>Styled Components is cool</p>
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
);
```
