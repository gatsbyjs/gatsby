---
title: What is JSX pragma?
date: 2019-08-02
author: Amberley Romo
excerpt: "Theme UI uses custom JSX pragma to make JSX theme-aware. But what is JSX pragma?"
tags:
  - themes
  - theme-ui
---

If you’re looking into using [Theme UI](https://theme-ui.com/) , you’ll come across some (potentially) unfamiliar looking syntax:

```javascript
/** @jsx jsx */
import { jsx } from "theme-ui"
```

This is a JSX pragma. What the heck is a JSX pragma? I had heard the phrase, but not thought too much about it until it came up with Gatsby theming -- and lots of other folks hadn't either:

https://twitter.com/amber1ey/status/1153382680916049921

## Striking a balance in documentation

In any software project or framework, it can be difficult to define where documentation should start or end. While you might not need to know exactly what a custom JSX pragma is in order to use Theme UI, for example, maybe you want to.

🤔 If we exclude it, will that be distracting? “What the heck is that? I’m going to go down a Google rabbit hole trying to find out.”

🤯 If we include it, will it be overwhelming? “I just want to style a theme, why are you talking to me about pragmas??”

So, a happy medium. If you **are** interested, here’s a blog post for you!

## What is a pragma?

A pragma is a compiler directive. It tells the compiler how it should handle the contents of a file.

An example of this in JavaScript is `'use strict'` mode. `'use strict'` is a directive that enables JavaScript's [Strict Mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode), which is a way to opt in to a more restricted variant of JavaScript. It denotes that the code should be processed in a specific way.

## What is JSX pragma?

JSX syntax on its own isn’t readable by the browser. In order to ship something readable to the browser, JSX needs to be converted to plain JavaScript.

Most React-based frameworks (like Gatsby), come with tooling already set up to support this conversion (usually Babel). How does that tooling know how to transform JSX? By default, [the Babel plugin](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx) will convert JSX into JavaScript that calls the `React.createElement` function.

Take the following JSX, for example:

```jsx
const element = <h1 className="greeting">Hello, world!</h1>
```

That JSX syntax _compiles to_ a call to `React.createElement`, like this:

```javascript
const element = React.createElement(
  "h1",
  { className: "greeting" },
  "Hello, world!"
)
```

Other libraries like Preact, Emotion, and Vue.js use different custom functions, and handle JSX differently.

## Using a custom JSX pragma

There are two ways to specify a custom function (and therefore replace `React.createElement`):

1. Add an option to the Babel plugin
2. Set a _pragma comment_ at the beginning of a module

### Add an option to the Babel plugin

Changing the function in the Babel plugin will transform _all_ JSX in an application to use the specified function.

### Set a pragma comment

Using a pragma comment will limit the change to the modules the comment is added to. Therefore, you can use `React.createElement` by default, and _opt in_ to the custom function only where needed. This is [the approach taken in Theme UI](/docs/theme-ui/#adding-styles-to-elements).

## Why use a custom JSX pragma?

Using a custom JSX pragma is useful when you want to customize the transform process of JSX => JavaScript.

- Emotion uses a [custom JSX pragma to use the Emotion `css` prop](https://emotion.sh/docs/css-prop#jsx-pragma).
- Theme UI uses a custom JSX pragma to add support for Theme UI's `sx` prop, which is used to style elements by referencing values from the theme object.

## Further reading

- [WTF is JSX](https://jasonformat.com/wtf-is-jsx/)
- [JSX Pragma doc](https://theme-ui.com/jsx-pragma) in Theme UI documentation.
- [JSX Represents Objects](https://reactjs.org/docs/introducing-jsx.html#jsx-represents-objects) in React.js documentation.
