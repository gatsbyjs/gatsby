---
title: Extending Shadowed Components
date: 2019-07-02
author: John Otander
excerpt: "Extending components when using Component Shadowing can be a powerful pattern for making small changes."
tags:
  - themes
---

[Component Shadowing](/blog/2019-04-29-component-shadowing/)
provides a powerful API for customizing the rendering of components
and even entire pages. For example, changing the logo might involve
shadowing that component by creating your custom implementation
in a file named `src/gatsby-theme-blog/components/logo.js`. Now,
with recent improvements shipped to Gatsby core, you can _extend_
any component or file in the `src` directory.

This means that you can import the component you're shadowing and
then render it. Consider a scenario where you have a custom Card
component that you want to wrap the author's bio in.

Before component extending was added this meant you had to copy over
the entire component implementation from the theme to wrap it with
your Card. It might look something like:

```js:title=src/gatsby-theme-blog/components/author.js
import React from "react"
import { Avatar, MediaObject, Icon } from "gatsby-theme-blog"
import Card from "../components/card"

export default ({ name, bio, avatar, twitterUrl, githubUrl }) => (
  <Card>
    <MediaObject>
      <Avatar {...avatar} />
      <div>
        <h3>{name}</h3>
        <p>{bio}</p>
        <a href={twitterUrl}>
          <Icon name="twitter" />
        </a>
        <a href={githubUrl}>
          <Icon name="github" />
        </a>
      </div>
    </MediaObject>
  </Card>
)
```

This workflow isn't too bad, especially since the component is relatively
straightforward. However, it could be optimized in scenarios where
you want to wrap a component or pass a different prop without having
to worry about the component's internals.

## Importing the Shadowed Component

In the above example it'd be preferable to be able to import the
Author component and wrap it with your Card.

Now, that component extending has been added you can do the
following instead:

```js:title=src/gatsby-theme-blog/components/author.js
import React from "react"
import { Author } from "gatsby-theme-blog/src/components/author"
import Card from "../components/card"

export default props => (
  <Card>
    <Author {...props} />
  </Card>
)
```

This is a quick and efficient way to customize rendering
without needing to worry about the implementation details of
the component you're looking to customize. Extending the shadowed
component means you can use composition, leveraging a great feature
from React.

## Applying New Props

In some cases there could be a component with different variants
without an API to modify it outside of shadowing. With component
extending you can import that component and then add your new
prop to change it.

If `NewsletterButton` accepts a `variant` prop which changes the
look and colors of the button, you can use it when you extend
the component. Below, `NewsletterButton` is re-exported and
`variant="link"` is added in the shadowed file to override it's
default value.

```js:title=src/gatsby-theme-blog/components/newsletter/button.js
import { NewsletterButton } from "gatsby-theme-blog/src/components/newsletter"

export default props => <NewsletterButton {...props} variant="link" />
```

## Using the CSS Prop

In addition to passing a different prop to a component you're extending,
you might want to apply CSS using the [Emotion CSS prop](/docs/emotion).
This will allow you to change the styling of a particular component without
changing any of its functionality.

```js:title=src/gatsby-theme-blog/components/newsletter/button.js
import { NewsletterButton } from "gatsby-theme-blog/src/components/newsletter"

export default props => (
  <NewsletterButton
    css={{
      backgroundColor: "rebeccapurple",
      color: "white",
      boxShadow: "none",
    }}
    {...props}
  />
)
```

**Note:** For this approach to work `NewsletterButton` has to accept a
`className` property.

## Change an Object

Another use case might be changing a `theme.js` file that a Gatsby
Theme uses to set colors globally.

```js:title=src/gatsby-theme-blog/theme.js
import theme from "gatsby-theme-blog/src/theme"

export default { ...theme, primary: "tomato" }
```

This provides a nice interface to extend an object if you want to
change a couple values from the defaults.

## Conclusion

If you need to make a small change to an existing component or
add an additional prop, extending the component via shadowing can
be an effective pattern.
