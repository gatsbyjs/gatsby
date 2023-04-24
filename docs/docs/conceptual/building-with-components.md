---
title: Building with Components
---

To use Gatsby, you will need a basic understanding of React components.

The [official React tutorial](https://reactjs.org/tutorial/tutorial.html) is a good place to start.

## Why React components?

React's component architecture simplifies building large websites by encouraging modularity, reusability, and clear abstractions. React has a large ecosystem of open source components, tutorials, and tooling that can be used seamlessly for building sites with Gatsby. Gatsby is built to behave almost exactly like a normal React application.

The following model shows how data from a source can be queried by GraphQL for use inside components in the process of building a Gatsby site:

<ComponentModel initialLayer="View" />

[Thinking in React](https://reactjs.org/docs/thinking-in-react.html)
is a good resource for learning how to structure applications with React.

## How does Gatsby use React Components?

Everything in Gatsby is built using components.

A basic directory structure of a project might look like this:

```text
.
├── posts
│   ├── 01-01-2017
│   │   └── index.md
│   ├── 01-02-2017
│   │   └── index.md
│   └── 01-03-2017
│       └── index.md
├── gatsby-config.js
├── package.json
└── src
    ├── components
    │   └── seo.jsx
    ├── pages
    │   ├── index.jsx
    │   └── about.jsx
    └── templates
        └── post.jsx
```

### Page components

Components under `src/pages` become pages automatically with paths based on their file name. For example `src/pages/index.jsx` is mapped to `yoursite.com` and `src/pages/about.jsx` becomes `yoursite.com/about/`. Every `.js`, `.jsx`, or `.tsx` file in the pages directory must resolve to a React component, otherwise your build will fail.

Example:

```jsx:title=src/pages/about.jsx
import * as React from "react"

function AboutPage() {
  return (
    <div className="about-container">
      <p>About me.</p>
    </div>
  )
}

export default AboutPage
```

### Page template components

You can programmatically create pages using "page template components". All pages are React components but very often these components are just wrappers around data from files or other sources.

`src/templates/post.jsx` is an example of a page template. It queries GraphQL for markdown data (sourcing from the `posts` directory) and then renders the page using this data.

See [part six](/docs/tutorial/getting-started/part-6/) of the tutorial for a detailed introduction to programmatically creating pages.

Example:

```jsx:title=src/templates/post.jsx
import * as React from "react"
import { graphql } from "gatsby"

function BlogPostTemplate(props) {
  const post = props.data.markdownRemark
  return (
    <div>
      <h1>{post.frontmatter.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </div>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
      }
    }
  }
`
```

### Non-page components

A non-page component is one that's embedded inside some other component, forming a component hierarchy. An example would be a SEO component that's included in multiple page components. Gatsby uses GraphQL to enable components to declare the data they need. Using the [useStaticQuery hook](/docs/how-to/querying-data/use-static-query/), you can colocate a non-page component with its data. In the example above that would be the `src/components/seo.jsx` component. Here's a guide on how to [create a SEO component](/docs/how-to/adding-common-features/adding-seo-component/).
