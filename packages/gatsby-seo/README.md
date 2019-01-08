# gatsby-seo

A React component that implements some common search-engine optimization technniques. Use this component to get up and running implementing robust, optimized by default search engine optimization and social sharing support.

## Install

```shell
npm install gatsby-seo react-helmet --save
```

Additionally, this component requires peer dependencies of `prop-types` and `react` (and `gatsby`!), so install those if you haven't already:

```shell
npm install react prop-types --save
```

## Usage

This component establishes some defaults based on `gatsby-config.js`, specifically it statically extracts the following values from `siteMetadata`: `description`, `author`, and `siteUrl`. If you haven't already, ensure your `gatsby-config.js` contains those fields, like so:

```js
module.exports = {
  siteMetadata: {
    title: "Your awesome site",
    description:
      "This is a site that is awesome because it has SEO baked in, by default!",
    author: "Jay Gatsby",
    siteUrl: "https://gatsby-example.com",
  },
}
```

Finally, you can _use_ the component in any component. If you're using `gatsby-starter-blog` or `gatsby-starter-default` you _already_ have this component available for usage!

### Using the component

This presumes usage in the page component `src/pages/about.js`, but `gatsby-seo` can be used _anywhere_. It is _just_ a React component, after all!

```jsx
import React from "react"
import SEO from "gatsby-seo"
import { graphql } from "gatsby"

function AboutPage() {
  // you may also have a Layout component wrapping!
  return (
    <React.Fragment>
      <SEO
        title="About us"
        description="Learn all about our great application and the team that made it!"
      />
      <h1>About us</h1>
      <p>We are great because we care about SEO!</p>
    </React.Fragment>
  )
}

export default AboutPage
```

<!-- TODO: show link to starters usage when it's integrated -->

### Props

|     Name      | Description                                                                         |   Type   | Default |
| :-----------: | ----------------------------------------------------------------------------------- | :------: | :-----: |
|  `children`   | A React node (child) to render, will be "passed" to react-helmet                    |  `node`  |         |
| `description` | A description (160 characters or so!) to replace the `og` and `twitter` description | `string` |         |
|    `lang`     | A default language to add to the `html` element                                     | `string` |  `en`   |
|    `link`     | An array of `link` properties                                                       | `array`  |  `[]`   |
|    `meta`     | An array of `meta` properties                                                       | `array`  |  `[]`   |
|  `keywords`   | An array of keywords                                                                | `array`  |  `[]`   |
|  **`title`**  | The title of the page/template                                                      | `string` |         |
