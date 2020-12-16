---
title: Bulma
---

[Bulma](https://bulma.io) is a free, open source CSS framework based on Flexbox. This guide will show you how to get started with Gatsby and Bulma.

This guide assumes that you have a Gatsby project set up. If you need to set up a project, head to the [**Quick Start guide**](/docs/quick-start), then come back.

## Installation

For starters, let's install all the required packages we're going to need.

`yarn add bulma sass gatsby-plugin-sass`

Then, add the `gatsby-plugin-sass` in to `gatsby-config.js`.

```javascript:title=gatsby-config.js
plugins: [`gatsby-plugin-sass`],
```

## File for styles

Now is the time to create a SCSS file that holds your simple style customization and the import statement for Bulma.

(To keep things simple, insert the file next to `index.js` in the pages-directory)

```scss:title=mystyles.scss
@charset "utf-8";

// If need, change your variables before importing Bulma
$title-color: #ff0000;

@import "~bulma/bulma.sass";
```

## Using Bulma

The last step is to import the style and use it.

Replace the default contents of the `index.js` file.

```jsx:title=index.js
import React from "react"
import "./mystyles.scss"

const IndexPage = () => {
  return (
    <div className="container">
      <div className="columns">
        <div className="column">
          <h2 className="title is-2">Level 2 heading</h2>
          <p className="content">Cool content. Using Bulma!</p>
        </div>

        <div className="column is-four-fifths">
          <h2 className="title is-2">Level 2 heading</h2>
          <p className="content">This column is cool too!</p>
        </div>
      </div>
    </div>
  )
}

export default IndexPage
```

And that's all there is to it! Now you can use Bulma as you normally would.

## Resources

- [Bulma documentation on how to use Sass](https://bulma.io/documentation/customize/with-node-sass/)
