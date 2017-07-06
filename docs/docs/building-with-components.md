---
title: Building with Components
---

## Requirements

To use Gatsby, you will need a basic understanding of React components.

The [official tutorial](https://facebook.github.io/react/tutorial/tutorial.html) is a good place to start.

## Why React components?

React allows building big complicated webapps while preserving modularity, reusabilty, and clear abstraction. React also has great devtools available for debugging the applicattion.

Here you can read more about [Thinking in React](https://facebook.github.io/react/docs/thinking-in-react.html).

## How does Gatsby use React Components?

Everything in Gatsby is built using components.

A basic directory structure of a project might look like this:

```sh
.
├── gatsby-config.js
├── package.json
└── src
    ├── html.jsx
    ├── pages
    │   ├── index.jsx
    │   └── posts
    │       ├── 01-01-2017
    │       │   └── index.md
    │       ├── 01-02-2017
    │       │   └── index.md
    │       └── 01-03-2017
    │           └── index.md
    ├── templates
    │   └── post.jsx
    │
    └── layouts
        └── index.jsx
```

### Base HTML generation

`src/html.jsx` is responsible for generating the base HTML document, where the react component tree is going to be mounted.

Example:

```jsx
import React from 'react';
import favicon from './favicon.png';

let inlinedStyles = '';
if (process.env.NODE_ENV === 'production') {
  try {
    inlinedStyles = require('!raw-loader!../public/styles.css');
  } catch (e) {
    console.log(e);
  }
}

export default class HTML extends React.Component {
  render() {
    let css;
    if (process.env.NODE_ENV === 'production') {
      css = (
        <style
          id="gatsby-inlined-css"
          dangerouslySetInnerHTML={{ __html: inlinedStyles }}
        />
      );
    }
    return (

      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          {this.props.headComponents}
          <link rel="shortcut icon" href={favicon} />
          {css}
        </head>
        <body>
          <div
            id="___gatsby"
            dangerouslySetInnerHTML={{ __html: this.props.body }}
          />
          {this.props.postBodyComponents}
        </body>
      </html>
    );
  }
}
```

In this file you can modify the `<head>` metadata, general structure of the document and add external links.

### UI Layouts

`src/layouts/index.jsx` (optional) wraps page components. You can use use it for site-wide parts of the site like headers and footers.

Example:

```jsx
import React from 'react';
import Navigation from '../components/Navigation/Navigation.jsx';

export default class Template extends React.Component {

  render() {
    const { children } = this.props;
    return (
      <Navigation>
        {children()}
      </Navigation>
    );
  }
}
```

### Page generation

Components under `src/pages` are automatically mapped to pages with paths based on their file name. For example `src/pages/index.jsx` is mapped to `yoursite.com` meanwhile `src/pages/about.jsx` is `yoursite.com/about/`.

Example:

`src/pages/about.jsx`

```jsx
import React, { Component } from 'react';

class AboutPage extends Component {
  render() {
    const config = this.props.data.site.siteMetadata;
    return (
        <div className="about-container">
          <p>About me.</p>
        </div>
    );
  }
}

export default AboutPage;
```

You may have noticed that `src/pages/posts` also contains markdown files. You can transform any file into HTML pages using [Gatsby plugins](https://www.gatsbyjs.org/docs/plugins/).

### Page templates

`src/templates/post.jsx` (optional) is an example of a page component. It queries the GraphQL schema for markdown data and then renders the page using this data.

Example:

```jsx
import React from "react"

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark

    return (
      <div>
        <h1>{post.frontmatter.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
query BlogPostBySlug($slug: String!) {
  markdownRemark(fields: { slug: { eq: $slug }}) {
    html
    frontmatter {
      title
    }
  }
}
`
```

These are examples of the different ways React components are used in Gatsby sites. To see full working examples, check out the [examples directory](https://github.com/gatsbyjs/gatsby/tree/1.0/examples) in the Gatsby repo.
