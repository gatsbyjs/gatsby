---
title: "Creating Hybrid Pages (with static and dynamic components"
---

Gatsby can be used to create a hybrid, 
_[app-shell](https://developers.google.com/web/fundamentals/architecture/app-shell) like_, app. 
A hybrid Gatsby app is made up of both statically rendered pages and hyrbid pages (with both static and 
dynamic components). 

Hybrid pages are also known as *dynamic pages* or *client-only routes*.

An example architecture of a hybrid site could be:

- **`/layouts/index.js`**
  
  Comprises `/components/header.js`and `/components/footer.js` components that handle data from a [GraphQL query](https://www.gatsbyjs.org/tutorial/part-four/#our-first-graphql-query) and/or [data source](https://www.gatsbyjs.org/tutorial/part-four/#source-plugins). For example, a menu with items 
  created from a CMS menu API.

- **`/templates/page.js`**

  Uses static template code and handles data from a GraphQL query and/or data source (like a CMS 
  page API) to create a static page. For example, a static marketing page.

- **`/pages/index.js`**, **`/pages/blog.js`**, **`/pages/index.js`**, **`/components/sidebar.js`**

  These components:
  - use static template code - **that gets statically generated**
  - handle data a GraphQL query and/or data source (like CMS page, sidebar/widget, index/list 
  API) - **that gets statically generated**
  - handle data from a live source - **that remains dynamic** - utilising React methods like 
  [componentDidMount](https://reactjs.org/docs/react-component.html#componentdidmount) and API 
  calls to consume dynamic content. Data can also be interactive using usual React code.

## To create a hybrid page (dynamic/client-only) route

You want to add code to your `gatsby-node.js` like the following:

_Note: There's also a plugin that will set up the creation of client-paths declaratively:
[gatsby-plugin-create-client-paths](/packages/gatsby-plugin-create-client-paths/)_.

```javascript
// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.

exports.onCreatePage = async ({ page, boundActionCreators }) => {
  const { createPage } = boundActionCreators;
  
  // We want to create our hybrid (`client-only`) routes, by matching the 
  // `page.path.match` and the `page.matchPath` special key that's used in 
  // `client-only` React components.
  
  // So, if physical page path starts with `/blog` (so `/pages/blog.js`)
  if (page.path.match(/^\/blog/)) { 
  
    // create a matchPath
    page.matchPath = "/blog(/:path)"; 
    
    // create the Gatsby page
    createPage(page);
 }
};
```