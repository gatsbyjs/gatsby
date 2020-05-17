---
title: Creating Prefixed 404 Pages for Different Languages
---

## Use onCreatePage API

Using the [`onCreatePage`](/docs/node-apis/#onCreatePage) API in your project's `gatsby-node.js` file, it's possible to create different 404 pages for different URL prefixes, such as `/en/`).

Here is an example that shows you how to create an English 404 page at `src/pages/en/404.js`, and a German 404 page at `/src/pages/de/404.js`:

```jsx:title=src/pages/en/404.js
import React from "react"
import Layout from "../../components/layout"

export default function NotFound() {
  return (
    <Layout>
      <h1>Page Not Found</h1>
      <p>Oops, we couldn't find this page!</p>
    </Layout>
  )
}
```

```jsx:title=src/pages/de/404.js
import React from "react"
import Layout from "../../components/layout"

export default function NotFound() {
  return (
    <Layout>
      <h1>Seite nicht gefunden</h1>
      <p>Ups, wir konnten diese Seite nicht finden!</p>
    </Layout>
  )
}
```

Now, open up your project's `gatsby-node.js` and add the following code:

```javascript:title=gatsby-node.js
exports.onCreatePage = async ({ page, actions }) => {
  const { createPage, deletePage } = actions

  // Check if the page is a localized 404
  if (page.path.match(/^\/[a-z]{2}\/404\/$/)) {
    const oldPage = { ...page }

    // Get the language code from the path, and match all paths
    // starting with this code (apart from other valid paths)
    const langCode = page.path.split(`/`)[1]
    page.matchPath = `/${langCode}/*`

    // Recreate the modified page
    deletePage(oldPage)
    createPage(page)
  }
}
```

## Use createPages API

If you're using [gatsby-plugin-i18n](/docs/localization-i18n/#gatsby-plugin-i18n) to make a i18n site, and want to generate all pages dynamically by defining `markdown` files in different languages including `404.js`. Using the [`createPages`](/docs/node-apis/#createPages) API is properly a better way.

First of all, create a 404 template file in `src/templates/404.js`.

```jsx:title=src/templates/404.js
import React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../../components/layout"

export const query = graphql`
  query NotFoundQuery($langKey: String!) {
    markdownRemark(fields: { langKey: { eq: $langKey }, fileName: { regex: "/404/" } }) {
      frontmatter {
        header
        subheader
        home
      }
    }
  }
`;

export default function NotFound({ data, pageContext: { langCode } }) => {
  const {
    markdownRemark: { frontmatter: { header, subheader, home } },
  } = data;

  return (
    <Layout>
      <h1>{header}</h1>
      <p>{subheader}</p>
      <Link to={`/${langCode}/`}>{home}</Link>
    </Layout>
  );
};
```

Secondly, open your project's `gatsby-node.js` file, generate 404 pages dynamically and pass `langCode` to `matchPath` as well.

```javascript:title=gatsby-node.js
exports.createPages = ({ actions: { createPage } }) => {
  const page404 = path.resolve("./src/templates/404.js");

  ["en", "de"].forEach((langCode) => {
    createPage({
      path: `/${langCode}/404/`,
      matchPath: `/${langCode}/*`,
      component: page404,
      context: {
        langCode,
      },
    });
  });
};
```

Finally, create your i18n markdown files and import them by config `gatsby-config.js`.

```markdown:title=content/404.en.md
---
header: Page Not Found
subheader: Oops, we couldn't find this page!
home: To Home
---
```

```markdown:title=content/404.de.md
---
header: Seite nicht gefunden
subheader: Ups, wir konnten diese Seite nicht finden!
home: nach Hause
---
```

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content`,
      },
    },
  ]
}
```

## It's done

Now, whenever Gatsby creates a page, it will check if the page is a localized 404 with a path in the format of `/XX/404/`. If this is the case, then it will get the language code, and match all paths starting with this code, apart from other valid paths. This means that whenever you visit a non-existent page on your site, whose path starts with `/en/` or `/de/` (e.g. `/en/this-does-not-exist`), your localized 404 page will be displayed instead.

For best results, you should configure your server to serve these 404 pages in the same manner - i.e. for `/en/<non existent path>`, your server should serve the page `/en/404/`. Otherwise, you'll briefly see the default 404 page until the Gatsby runtime loads. If you're using Netlify, you can use [`gatsby-plugin-netlify`](/packages/gatsby-plugin-netlify/) to do this automatically. Note that you should still create a default 404 page (usually at `src/pages/404.js`) to handle non-prefixed paths, e.g. `https://example.com/this-does-not-exist`.
