---
title: Terminology
---

Throughout the Gatsby code, you'll see the below object fields and variables mentioned. Their definitions and reason for existence are defined below.

## Page 

### Page Object

created by calls to [createPage](/docs/actions/#createPage) (see [Page Creation](/docs/page-creation)).

- [path](#path)
- [matchPath](#matchpath)
- [jsonName](#jsonname)
- [component](#component)
- [componentChunkName](#componentchunkname)
- [internalComponentName](#internalcomponentname) (unused)
- [context](#pagecontext)
- updatedAt

The above fields are explained below

### path

The publicly accessible path in the web URL to access the page in question. E.g

`/blog/2018-07-17-announcing-gatsby-preview/`.

It is created when the page object is created (see [Page Creation](/docs/page-creation/))

### Redux `pages` namespace

Contains a map of Page [path](#path) -> [Page object](#page-object).

### matchPath

Think of this instead as `client matchPath`. It is ignored when creating pages during the build. But on the frontend, when resolving the page from the path ([find-path.js]()), it is used (via [reach router](https://github.com/reach/router/blob/master/src/lib/utils.js)) to find the matching page. Note that the [pages are sorted](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/pages-writer.js#L38) so that those with matchPaths are at the end, so that explicit paths are matched first.

This is also used by [gatsby-plugin-create-client-paths](/packages/gatsby-plugin-create-client-paths/?=client). It duplicates pages whose path match some client-only prefix (e.g `/app/`). The duplicated page has a `matchPath` so that it is resolved first on the front end.

It is also used by [gatsby-plugin-netlify](http://localhost:8000/packages/gatsby-plugin-netlify/?=netlify) when creating `_redirects`.

### jsonName

The logical name for the query result of a page. Created during [createPage](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/redux/actions.js#L229). Name is constructed using kebabHash of page path. E.g. For above pagePath, it is:

`blog-2018-07-17-announcing-gatsby-preview-995`

### component

The path on disk to the javascript file containing the React component. E.g

`/src/templates/template-blog-post.js`

Think of this as `componentPath` instead.

### Redux `components ` namespace

Mapping from `component` (path on disk) to its [Page object](#page-object). It is created every time a page is created (by listening to `CREATE_PAGE`).

```javascript
{
  `/src/templates/template-blog-post.js`: {
    query: ``,
    path: `/blog/2018-07-17-announcing-gatsby-preview/`,
    jsonName: `blog-2018-07-17-announcing-gatsby-preview-995`,
    componentPath: `/src/templates/template-blog-post.js`,
    ...restOfPage
  }
}
```

Query starts off as empty, but is set during the extractQueries phase by [query-watcher/handleQuery](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/query-watcher.js#L68), once the query has compiled by relay (see [Query Extraction](/docs/query-extraction/)).

### componentChunkName

The [page.component](#component) (path on disk), but passed (as above), kebab hashed. E.g, the componentChunkName for component

`/src/templates/template-blog-post.js`

is

`component---src-templates-template-blog-post-js`

TODO: Mention how used by webpack

### internalComponentName

If the path is `/`, internalComponentName = `ComponentIndex`. Otherwise, for a path of `/blog/foo`, it would be `ComponentBlogFoo`.

Created as part of page, but currently unused.

### page.context

This is [merged with the page itself](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/page-query-runner.js#L153) and then is [passed to graphql](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/query-runner.js#L40) queries as the `context` parameter.

## Query

### dataPath

Path to the page's query result. Relative to `/public/static/d/{modInt}`. Name is kebab hash on `path--${jsonName}`-`result->sha1->base64`. E.g

`621/path---blog-2018-07-17-announcing-gatsby-preview-995-a74-dwfQIanOJGe2gi27a9CLKHjamc`

Set after [Query Execution](/docs/query-execution/#save-query-results-to-redux-and-disk) has finished.

### Redux `jsonDataPaths` namespace (dataPaths)

Map of page [jsonName](#jsonname) to [dataPath](#datapath). Updated after [Query Execution](/docs/query-execution/#save-query-results-to-redux-and-disk). E.g

```
{
  // jsonName -> dataPath
  "blog-2018-07-17-announcing-gatsby-preview-995": "621/path---blog-2018-07-17-announcing-gatsby-preview-995-a74-dwfQIanOJGe2gi27a9CLKHjamc"
}
```

This is also known via the `dataPaths` variable.

### Query result file

`/public/static/d/621/${dataPath}`

E.g

`/public/static/d/621/path---blog-2018-07-17-announcing-gatsby-preview-995-a74-dwfQIanOJGe2gi27a9CLKHjamc.json`

This is the actual result of the GraphQL query that was run for the page `/blog/2018-07-17-announcing-gatsby-preview/`. The contents would look something like:

```javascript
{
  "data": {
    "markdownRemark": {
      "html": "<p>Today we....",
      "timeToRead": 2,
      "fields": {
        "slug": "/blog/2018-07-17-announcing-gatsby-preview/"
      },
      "frontmatter": {
        "title": "Announcing Gatsby Preview",
        "date": "July 17th 2018",
        ...
      },
      ...
    }
  },
  "pageContext": {
    "slug": "/blog/2018-07-17-announcing-gatsby-preview/",
    "prev": {
      ...
    },
    "next": null
  }
}
```

For a query such as:

```javascript
export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      timeToRead
      fields {
        slug
      }
      frontmatter {
        title
        date(formatString: "MMMM Do YYYY")
        ...
      }
      ...
    }
  }
`
```

## Webpack stuff

### /public/${componentChunkName}-[chunkhash].js

The final webpack js bundle for the blog template page

E.g

`/public/component---src-templates-template-blog-post-js-2df3a086e8d2cdf690aa.js`

### /.cache/async-requires.js

Generated javascript file that exports `components` and `data` fields.

`components` is a mapping from `componentChunkName` to a function that imports the component's original source file path. This is used for code splitting. The import statement is a hint to webpack that that javascript file can be loaded later. The mapping And also provides a hint to the `componentChunkName`

`data` is a function that imports `/.cache/data.json`. Which is code split in the same way

E.g

```js
exports.components = {
  "component---src-templates-template-blog-post-js": () =>
    import("/Users/amarcar/dev/gatsbyjs/gatsby/www/src/templates/template-blog-post.js" /* webpackChunkName: "component---src-templates-template-blog-post-js" */),
}

exports.data = () =>
  import("/Users/amarcar/dev/gatsbyjs/gatsby/www/.cache/data.json")
```

### .cache/data.json

During the `pagesWriter` bootstrap phase (last phase), `pages-writer.js` writes this file to disk. It contains `dataPaths` and `pages`.

`dataPaths` is the same as the definition above.

`pages` is a dump of the redux `pages` component state. Each page contains:

- componentChunkName
- jsonName
- path

