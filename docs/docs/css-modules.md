---
title: Component-scoped styles with CSS Modules
---

Writing component-scoped CSS helps writing normal CSS safely. Gone are the worries of selector name collisions.

Gatsby works out of the box with [CSS Modules](https://github.com/css-modules/css-modules), a popular solution for writing component-scoped CSS.

Here is an [example site that uses CSS Modules](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-css-modules).

## What is a CSS Module?

Quoting from [the CSS Module homepage](https://github.com/css-modules/css-modules):

> A **CSS Module** is a CSS file in which all class names and animation names are scoped locally by default.

CSS Modules let you write styles in CSS files but consume them as JavaScript objects for additional processing and safety. CSS Modules are very popular because they automatically make class and animation names unique so you don't have to worry about selector name collisions.

_Note_: adding a stable CSS class to your JSX markup along with your CSS Modules can make it easier to users to include [User Stylesheets](https://www.viget.com/articles/inline-styles-user-style-sheets-and-accessibility/) for accessibility.

## When to use CSS Modules

CSS Modules are highly recommended for those new to building with Gatsby (and React in general).

## How to build a page using CSS Modules

Visit the [CSS Modules section of the tutorial](/tutorial/part-two/#css-modules) to learn how to build a page using CSS Modules.
