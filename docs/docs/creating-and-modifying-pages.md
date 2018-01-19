---
title: "Creating and modifying pages"
---

Gatsby makes it easy to programmatically control your pages.

Pages can be created in three ways:

* In your site's gatsby-node.js by implementing the API
  [`createPages`](/docs/node-apis/#createPages)
* Gatsby core automatically turns React components in `src/pages` into pages
* Plugins can also implement `createPages` and create pages for you

You can also implement the API [`onCreatePage`](/docs/node-apis/#onCreatePage)
to modify pages created in core or plugins or to create client-only pages.

## Debugging help

To see what pages are being created by your code or plugins, you can query for
page information while developing in Graph*i*QL. Paste the following query in
the Graph*i*QL IDE for your site. The Graph*i*QL IDE is available when running
your sites development server at `HOST:PORT/___graphql` e.g.
`localhost:8000/___graphql`.

```graphql
{
  allSitePage {
    edges {
      node {
        path
        component
        pluginCreator {
          name
          pluginFilepath
        }
      }
    }
  }
}
```

You can also query for any `context` data you or plugins added to pages.

## Creating pages in gatsby-node.js

Often you will need to programmatically create pages. For example, you have
markdown files where each should be a page.

This example assumes that each markdown page has a "path" set in the frontmatter
of the markdown file.

```javascript
// Implement the Gatsby API “createPages”. This is called once the
// data layer is bootstrapped to let plugins create pages from data.
exports.createPages = ({ boundActionCreators, graphql }) => {
  const { createPage } = boundActionCreators;

  return new Promise((resolve, reject) => {
    const blogPostTemplate = path.resolve(`src/templates/blog-post.js`);
    // Query for markdown nodes to use in creating pages.
    resolve(
      graphql(
        `
          {
            allMarkdownRemark(limit: 1000) {
              edges {
                node {
                  frontmatter {
                    path
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          reject(result.errors);
        }

        // Create pages for each markdown file.
        result.data.allMarkdownRemark.edges.forEach(({ node }) => {
          const path = node.frontmatter.path;
          createPage({
            path,
            component: blogPostTemplate,
            // If you have a layout component at src/layouts/blog-layout.js
            layout: `blog-layout`,
            // In your blog post template's graphql query, you can use path
            // as a GraphQL variable to query for data from the markdown file.
            context: {
              path,
            },
          });
        });
      })
    );
  });
};
```

## Modifying pages created by core or plugins

Gatsby core and plugins can automatically create pages for you. Sometimes the
default isn't quite what you want and you need to modify the created page
objects.

### Removing trailing slashes

A common reason for needing to modify automatically created pages is to remove
trailing slashes.

To do this, in your site's `gatsby-node.js` add code similar to the following:

_Note: There's also a plugin that will remove all trailing slashes from pages automatically:
[gatsby-plugin-remove-trailing-slashes](/packages/gatsby-plugin-remove-trailing-slashes/)_.

```javascript
// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = ({ page, boundActionCreators }) => {
  const { createPage, deletePage } = boundActionCreators;
  return new Promise(resolve => {
    const oldPage = Object.assign({}, page);
    // Remove trailing slash unless page is /
    page.path = _path => (_path === `/` ? _path : _path.replace(/\/$/, ``));
    if (page.path !== oldPage.path) {
      // Replace new page with old page
      deletePage(oldPage);
      createPage(page);
    }
    resolve();
  });
};
```

### Creating client-only routes

If you're creating a "hybrid" Gatsby app with both statically rendered pages as
well as client-only routes (e.g. an app that combines marketing pages and your
app that lives under `/app/*`), you want to add code to your `gatsby-node.js`
like the following:

_Note: There's also a plugin that will set up the creation of client-paths declaratively:
[gatsby-plugin-create-client-paths](/packages/gatsby-plugin-create-client-paths/)_.

```javascript
// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = async ({ page, boundActionCreators }) => {
  const { createPage } = boundActionCreators;

  // page.matchPath is a special key that's used for matching pages
  // only on the client.
  if (page.path.match(/^\/app/)) {
    page.matchPath = "/app/:path";

    // Update the page.
    createPage(page);
  }
};
```

### Client Route Params

Gatsby can create client-only routes which take paramaters. 

We'll walk quickly through how to setup a route on your site like `/widgets/view/ID`.

**Build config:**

First configure `gatsby-node.js`:

```javascript
exports.onCreatePage = async ({ page, boundActionCreators }) => {
  const { createPage } = boundActionCreators;

  return new Promise((resolve, reject) => {
    // Add client route for all paths matching `/view/*`
    if (/view/.test(page.path)) {
      // Gatsby paths have a trailing `/`
      page.matchPath = `${page.path}:id`;
    }

    createPage(page);
    resolve();
  });
};
```

**Server:**

Links to these pages will work well client-side but fail if a user tries to visit a page directly (i.e. load the page from the server). This is due to your backend server not knowing how to handle the route.

Some server configuration is required to make these types of pages work in production. This configuration will vary depending on your server environment but here's a simple example configuration for NGINX:

```
location ~ "([a-z]*)\/view\/(\d*)$" {
    try_files $uri /$1/view/index.html;
}
```

This directive will provide the `widgets/view/index.html` file for any request like (widgets)/view/1. It will also support other pages by matching the first level of the URL, example `http://sitename/sprockets/view/1`.

**Client:**

Extracting path params from the route on the client requires that you use the `react-router` `<Route>` in your component. 

This can be made simpler by using a HOC:

```javascript
import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';

// Pass in route config, and the Content component you want rendered
export default (config, Content) => {
  const GatsbyClientRoute = (props) => {
    return (
      <Route
        {...props}
        {...config}
        component={Content}
      />
    )
  };

  return GatsbyClientRoute;
};
```

Use the HOC on the page component you want to access the path params:

```javascript
export default GatsbyClientRoute({path: '/widgets/view/:id'}, WidgetPage);
```

Full example page:

```javascript
import React from 'react';

import GatsbyClientRoute from '<PATH_TO_SRC>/components/hocs/gatsby-client-route';

class WidgetPageContent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { match } = this.props;
    console.log(match.params.id);
    return (
      <div>
        Widget: {match.params.id}
      </div>
    );
  }
};

export default GatsbyClientRoute(
// NOTE this must match path.matchPath
  {path: '/widgets/view/:id'},
  WidgetPageContent
);
```

Using the URL `http://localhost:8000/wigets/view/10` will console log `10` and the markup will say `Widget: 10`.

### Choosing the page layout

By default, all pages will use the layout found at `/layouts/index.js`.

You may wish to choose a custom layout for certain pages (such as removing
header and footer for landing pages). You can choose the layout component when
creating pages with the `createPage` action by adding a layout key to the page
object or modify pages created elsewhere using the `onCreatePage` API. All
components in the `/layouts/` directory are automatically available.

```javascript
// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = async ({ page, boundActionCreators }) => {
  const { createPage } = boundActionCreators;

  return new Promise((resolve, reject) => {
    if (page.path.match(/^\/landing-page/)) {
      // It's assumed that `landingPage.js` exists in the `/layouts/` directory
      page.layout = "landingPage";

      // Update the page.
      createPage(page);
    }

    resolve();
  });
};
```
