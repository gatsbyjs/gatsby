---
title: Introduction to Using CSS in Gatsby
typora-copy-images-to: ./
---

<!-- Idea: Create a glossary to refer to. A lot of these terms get jumbled -->

<!--
  - Global styles
  - Component css
  - CSS-in-JS
  - CSS Modules

-->

Welcome to part two of the Gatsby tutorial!

## What's in this tutorial?

In this part, you're going to explore options for styling Gatsby websites and dive deeper into using React components for building sites.

## Using global styles

Every site has some sort of global style. This includes things like the site's
typography and background colors. These styles set the overall feel of the
site—much like the color and texture of a wall sets the overall feel of a room.

### Creating global styles with standard CSS files

One of the most straightforward ways to add global styles to a site is using a global `.css` stylesheet.

#### ✋ Create a new Gatsby site

Start by creating a new Gatsby site. It may be best (especially if you're new to the command line) to close the terminal windows you used for part one, and start a new terminal session for this.

Open a new terminal window, create a new "hello world" gatsby site, and start the development server:

```shell
gatsby new tutorial-part-two https://github.com/gatsbyjs/gatsby-starter-hello-world
cd tutorial-part-two
gatsby develop
```

You now have a new Gatsby site (based on the Gatsby "hello world" starter) with the following structure:

```text
├── package.json
├── src
│   └── pages
│       └── index.js
```

#### ✋ Add styles to a css file

1. Create a `.css` file in your new project:

```shell
cd src
mkdir styles
cd styles
touch global.css
```

> Note: You'll need to either stop or restart the running development server, or open a second terminal window. Also, feel free to create these directories and files using your code editor, if you'd prefer.

You should now have a structure like this:

```text
├── package.json
├── src
│   └── pages
│       └── index.js
│   └── styles
│       └── global.css
```

2. Define some styles in the `global.css` file:

```css:title=src/styles/global.css
html {
  background-color: lavenderblush;
  color: rebeccapurple;
}
```

> Note: The placement of the example css file in a `/src/styles/` folder is arbitrary.

#### ✋ Include the stylesheet in `gatsby-browser.js`

1. Create the `gatsby-browser.js`

```shell
cd ../..
touch gatsby-browser.js
```

Your project's file structure should now look like this:

```text
├── package.json
├── src
│   └── pages
│       └── index.js
│   └── styles
│       └── global.css
├── gatsby-browser.js
```

> 💡 What is `gatsby-browser.js`? Don't worry about this too much for now -- For now, know that `gatsby-browser.js` is one of a handful of special files that Gatsby looks for, and uses (if they exist). Here, the naming of the file **is** important.

2. Import the stylesheet in the `gatsby-browser.js` file:

```javascript:title=gatsby-browser.js
import "./src/styles/global.css"

// or:
// require('./src/styles/global.css')
```

> Note: You can use Node.js `require` or `import` syntax. If you're not sure of the difference, just pick one.

If you take a look another look at your "hello world" project site, you should see your global css changes applied.

> Tip: This part of the tutorial has focused on the quickest and most straightforward way to get started styling a Gatsby site -- importing standard CSS files directly, using `gatsby-browser.js`. In most cases, the best way to add global styles is with a shared layout component. [Check out the docs](/docs/creating-global-styles/#how-to-add-global-styles-in-gatsby-with-standard-css-files) for more on that approach.

## Component CSS

Gatsby has a wealth of options available for styling components. In this tutorial, you'll explore one very popular method: CSS Modules.

### CSS-in-JS

While we won't cover CSS-in-JS in this initial tutorial, we encourage you to explore CSS-in-JS libraries because these solve many of the problems with traditional CSS plus help make your React components even smarter. There are mini-tutorials for two libraries, [Glamor](/docs/glamor/) and [Styled Components](/docs/styled-components/). Check out the following resources for background reading on CSS-in-JS:

[Christopher "vjeux" Chedeau's 2014 presentation that sparked this movement](https://speakerdeck.com/vjeux/react-css-in-js)
as well as
[Mark Dalgleish's more recent post "A Unified Styling Language"](https://medium.com/seek-blog/a-unified-styling-language-d0c208de2660).

### CSS Modules

Let's explore **CSS Modules**.

Quoting from
[the CSS Module homepage](https://github.com/css-modules/css-modules):

> A **CSS Module** is a CSS file in which all class names and animation names
> are scoped locally by default.

CSS Modules are very popular as they let you write CSS like normal but with a lot
more safety. The tool automatically makes class and animation names unique so
you don't have to worry about selector name collisions.

CSS Modules are highly recommended for those new to building with Gatsby (and
React in general).

Gatsby works out of the box with CSS Modules.

### Build a page using CSS Modules.

First, create a new `Container` component. Create a new directory at
`src/components` and then, in this new directory, create a file named
`container.js` and paste the following:

```javascript:title=src/components/container.js
import React from "react"
import containerStyles from "./container.module.css"

export default ({ children }) => (
  <div className={containerStyles.container}>{children}</div>
)
```

You'll notice we imported a css modules file named `container.module.css`. Let's make that.

In the same directory, create the `container.module.css` file and paste in it:

```css:title=src/components/container.module.css
.container {
  margin: 3rem auto;
  max-width: 600px;
}
```

Then, create a new page component by creating a file at
`src/pages/about-css-modules.js`:

```javascript:title=src/pages/about-css-modules.js
import React from "react"

import Container from "../components/container"

export default () => (
  <Container>
    <h1>About CSS Modules</h1>
    <p>CSS Modules are cool</p>
  </Container>
)
```

If you visit `http://localhost:8000/about-css-modules/`, your page should now look like:

![css-modules-1](css-modules-1.png)

Create a list of people with names, avatars, and short latin
biographies.

First, create the file for the CSS at
`src/pages/about-css-modules.module.css`. You'll notice that the file name ends
with `.module.css` instead of `.css` like normal. This is how you tell Gatsby
that this CSS file should be processed as CSS modules.

Paste the following into the file:

```css:title=src/pages/about-css-modules.module.css
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

Now import that file into the `about-css-modules.js` page you created earlier, by editing the first few lines
of the file to look like:

```javascript:title=src/pages/about-css-modules.js
import React from "react"
// highlight-next-line
import styles from "./about-css-modules.module.css"
import Container from "../components/container"

// highlight-next-line
console.log(styles)
```

The `console.log(styles)` code logs the resulting import so you can see what the processed file looks like.
If you open the developer console (using e.g. Firefox or Chrome's developer tools) in your browser, you'll see:

![css-modules-console](css-modules-console.png)

If you compare that to your CSS file, you'll see that each class is now a key in
the imported object pointing to a long string e.g. `avatar` points to
`about-css-modules-module---avatar----hYcv`. These are the class names CSS
Modules generates. They're guaranteed to be unique across your site. And because
you have to import them to use the classes, there's never any question about
where some CSS is being used.

Use your styles to create a `User` component.

Create the new component inline in the `about-css-modules.js` page
component. The general rule of thumb is this: if you use a component in multiple
places on a site, it should be in its own module file in the `components`
directory. But, if it's used only in one file, create it inline.

Modify `about-css-modules.js` so it looks like the following:

```jsx:title=src/pages/about-css-modules.js
import React from "react"
import styles from "./about-css-modules.module.css"
import Container from "../components/container"

console.log(styles)

// highlight-start
const User = props => (
  <div className={styles.user}>
    <img src={props.avatar} className={styles.avatar} alt="" />
    <div className={styles.description}>
      <h2 className={styles.username}>{props.username}</h2>
      <p className={styles.excerpt}>{props.excerpt}</p>
    </div>
  </div>
)
// highlight-end

export default () => (
  <Container>
    <h1>About CSS Modules</h1>
    <p>CSS Modules are cool</p>
    {/* highlight-start */}
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
    {/* highlight-end */}
  </Container>
)
```

The finished page should now look like:

![css-modules-final](css-modules-final.png)

### Other CSS options

Gatsby supports almost every possible styling option (if there isn't a plugin
yet for your favorite CSS option,
[please contribute one!](/docs/how-to-contribute/))

- [Sass](/packages/gatsby-plugin-sass/)
- [Emotion](/packages/gatsby-plugin-emotion/)
- [JSS](/packages/gatsby-plugin-jss/)
- [Stylus](/packages/gatsby-plugin-stylus/)

and more!

## What's coming next?

Now continue on to [Creating nested layout components](/tutorial/part-three/), the third part of the tutorial.
