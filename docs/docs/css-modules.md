---
title: CSS Modules
---

## CSS modules and Gatsby
Gatsby works out of the box with CSS Modules. Here is an [example site that uses CSS modules](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-css-modules).

## What is a CSS module?
Quoting from
[the CSS Module homepage](https://github.com/css-modules/css-modules):

> A **CSS Module** is a CSS file in which all class names and animation names
> are scoped locally by default.

CSS Modules are very popular as they let you write CSS like normal but with a lot
more safety. The tool automatically makes class and animation names unique so
you don't have to worry about selector name collisions.

## When to use CSS modules
CSS Modules are highly recommended for those new to building with Gatsby (and
React in general).

## How to build a page using CSS modules
First, create a new `Container` component. Create a new directory at
`src/components` and then, in this new directory, create a file named
`container.js` and paste the following:

```javascript
import React from "react"
import containerStyles from "./container.module.css"

export default ({ children }) => (
  <div className={containerStyles.container}>{children}</div>
)
```

You'll notice you imported a css modules file named `container.module.css`. Next, you'll make that file.

In the same directory, create the `container.module.css` file and paste in it:

```css
.container {
  margin: 3rem auto;
  max-width: 600px;
}
```

Then, create a new page component by creating a file at
`src/pages/about-css-modules.js`:

```javascript
import React from "react"

import Container from "../components/container"

export default () => (
  <Container>
    <h1>About CSS Modules</h1>
    <p>CSS Modules are cool</p>
  </Container>
)
```

If you are building your site locally, visit `http://localhost:8000/about-css-modules/`. Your page should now look like:

![css-modules-1](./images/css-modules-1.png)

Let's create a list of people with names, avatars, and short latin
biographies.

First, let's create the file for the CSS at
`src/pages/about-css-modules.module.css`. You'll notice that the file name ends
with `.module.css` instead of `.css` like normal. This is how you tell Gatsby
that this CSS file should be processed as CSS modules.

Paste the following into the file:

```css
.user {
  display: flex;
  align-items: center;
  margin: 0 auto 12px auto;
}

.user:last-child {
  margin-bottom: 0;
}

.avatar {
  flex: 0 0 96px;
  width: 96px;
  height: 96px;
  margin: 0;
}

.description {
  flex: 1;
  margin-left: 18px;
  padding: 12px;
}

.username {
  margin: 0 0 12px 0;
  padding: 0;
}

.excerpt {
  margin: 0;
}
```

Now import that file into the `about-css-modules.js` page you created earlier, by adding the following on lines 2 and 3.
(The `console.log(styles)` code logs the resulting import so you can see what the processed file looks like).

```javascript
import styles from "./about-css-modules.module.css"
console.log(styles)
```

If you open the developer console (using e.g. Firefox or Chrome's developer tools) in your browser, you'll see:

![css-modules-console](./images/css-modules-console.png)

If you compare that to your CSS file, you'll see that each class is now a key in
the imported object pointing to a long string e.g. `avatar` points to
`about-css-modules-module---avatar----hYcv`. These are the class names CSS
Modules generates. They're guaranteed to be unique across your site. And because
you have to import them to use the classes, there's never any question about
where some CSS is being used.

Now, use your styles to create a `User` component.

Create the new component inline in the `about-css-modules.js` page
component. The general rule of thumb is this: if you use a component in multiple
places on a site, it should be in its own module file in the `components`
directory. But, if it's used only in one file, create it inline.

Modify `about-css-modules.js` so it looks like the following:

```jsx{7-19,25-34}
import React from "react"
import styles from "./about-css-modules.module.css"
import Container from "../components/container"

console.log(styles)

const User = props => (
  <div className={styles.user}>
    <img src={props.avatar} className={styles.avatar} alt="" />
    <div className={styles.description}>
      <h2 className={styles.username}>{props.username}</h2>
      <p className={styles.excerpt}>{props.excerpt}</p>
    </div>
  </div>
)

export default () => (
  <Container>
    <h1>About CSS Modules</h1>
    <p>CSS Modules are cool</p>
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
```

The finished page should now look like:

![css-modules-final](./images/css-modules-final.png)

