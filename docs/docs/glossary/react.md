---
title: React
disableTableOfContents: true
---

Learn about React, including what it is, why you might use it, and how it fits into the Gatsby ecosystem.

## What is React?

React is a code library for building web-based user interfaces. It's written using [JavaScript](/docs/glossary#javascript), one of the programming languages used to create web pages.

Facebook first released React in 2013. The company still maintains the project, along with a community of contributors. It's free to use and open source under the terms of the [MIT License](https://github.com/facebook/react/blob/master/LICENSE).

Where publishing tools such as WordPress and Jekyll rely on a system of template files to create a UI, React uses [components](/docs/glossary#component). Components are contained chunks of JavaScript, CSS, and HTML or SVG that can be reused, shared, and combined to create a website or application.

Components may be purely presentational. For example, you might create a `Logo` component that's just an SVG image. Or a component may encapsulate functionality. An `InputBox` component might include an input control, a label, and some simple validation.

Components are also _composable_, which is a fancy way of saying that you can use multiple child components to create a parent component or view. This is how you will build Gatsby pages and templates.

React components respond to changes in _state_. In React, _state_ is a set of properties and values that determine how a component looks or behaves. State can change in response to user activity, such as a click or key press. State can also change as the result of a completed network request. When a value in a component's state changes, the component is the only part of the UI that changes. In other words, React can update part of a page or an entire view without requiring a full page reload.

Gatsby bundles React, [webpack](/docs/glossary#webpack), [GraphQL](/docs/glossary#graphql), and other tools into a single framework for building websites. With Gatsby, you get a head start on meeting your SEO, accessibility, and performance requirements. Rather than installing and configuring a development environment from scratch, you can install Gatsby and start building.

### Learn more about React

- [React](https://reactjs.org/) Official website
