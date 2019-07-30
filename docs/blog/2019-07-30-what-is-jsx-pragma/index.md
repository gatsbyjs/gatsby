---
title: What is JSX pragma?
date: 2019-07-30
author: Amberley Romo
excerpt: "TODO: Excerpt on JSX pragma."
tags:
  - themes
  - theme-ui
---

[Theme UI](https://theme-ui.com/) is a library for styling React apps with user-configurable design constraints. It allows you to style any component in your application with typographic, color, and layout values defined in a shared theme object.

Theme UI’s [`sx` prop](https://theme-ui.com/sx-prop) lets you style elements inline, using values from your shared theme object. To use the `sx` prop, you need to use a custom JSX pragma. What the heck is a JSX pragma?

## Striking a balance in documentation

In any software project or framework, it can be difficult to define where documentation should start or end. While you might not need to know exactly what a custom JSX pragma is in order to use Theme UI, for example, maybe you want to.

🤔 If we exclude it, will that be distracting? “What the heck is that? I’m going to go down a Google rabbit hole trying to find out.”

🤯 If we include it, will it be overwhelming? “I just want to style a theme, why are you talking to me about pragmas??”

So, a happy medium. If you **are** interested, here’s a blog post for you!

## What is a pragma?

A pragma is a compiler directive. It tells the compiler how it should handle the contents of a file.

An example of this in JavaScript is `'use strict'` mode. `'use strict'` is a directive that enables JavaScript's [Strict Mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode), which is a way to opt in to a more restricted variant of JavaScript. It denotes that the code should be processed in a different way.

## What is JSX pragma?

JSX syntax on its own isn’t readable by the browser. In order to ship something readable to the browser, JSX needs to be converted to plain JavaScript.

Most React-based frameworks (like Gatsby), come with tooling already set up to support this conversion. How does that tooling (generally Babel), know how to transform JSX? By default, it generally uses the `React.createElement` function.

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

## Using a custom JSX pragma

Theme UI requires the use of a custom JSX pragma. When using a custom JSX pragma, we're essentially telling the compiler, "here, use a different function to transform this input, instead of the default `React.createElement`.
