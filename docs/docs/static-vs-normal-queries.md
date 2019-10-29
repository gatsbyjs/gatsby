---
title: Static vs Normal Queries
---

> This documentation isn't up to date with the latest version of Gatsby.
>
> Outdated areas are:
>
> - describe how queries are stripped and JSON imports are rewritten
>
> You can help by making a PR to [update this documentation](https://github.com/gatsbyjs/gatsby/issues/14228).

## How StaticQuery differs from page query

StaticQuery can do most of the things that page query can, including fragments. The main differences are:

- page queries can accept variables (via `pageContext`) but can only be added to _page_ components
- StaticQuery does not accept variables (hence the name "static"), but can be used in _any_ component, including pages
- StaticQuery does not work with raw React.createElement calls; please use JSX, e.g. `<StaticQuery />`
  - _NOTE: you can also use the new `useStaticQuery` hook; more information below_
- Static Queries don't need to get run for each page.(ie:Just once)

## useStaticQuery hook

- Gatsby v2.1.0 introduces `useStaticQuery`, a Gatsby feature that allows you to use a React hook to query GraphQL
- `useStaticQuery` is a hook, contrary to `<StaticQuery />` which is a component
- Check out [how to query data at build time using `useStaticQuery`](https://www.gatsbyjs.org/docs/use-static-query/)

### staticQueryComponents

Started here because they're referenced in page-query-runner:findIdsWithDataDependencies.

The redux `staticQueryComponents` is a map from component jsonName to StaticQueryObject. E.g

```javascript
{
  `blog-2018-07-17-announcing-gatsby-preview-995` : {
    name: `/path/to/component/file`,
    componentPath: `/path/to/component/file`,
    id: `blog-2018-07-17-announcing-gatsby-preview-995`,
    jsonName: `blog-2018-07-17-announcing-gatsby-preview-995`,
    query: `raw GraphQL Query text including fragments`,
    hash: `hash of graphql text`
  }
}
```

The `staticQueryComponents` redux namespace is owned by the `static-query-components.js` reducer with reacts to `REPLACE_STATIC_QUERY` actions.

It is created in query-watcher. TODO: Check other usages

TODO: in query-watcher.js/handleQuery, we remove jsonName from dataDependencies. How did it get there? Why is jsonName used here, but for other dependencies, it's a path?

### Usages

- [websocket-manager](#TODO). TODO
- [query-watcher](#TODO).

  - `getQueriesSnapshot` returns map with snapshot of `state.staticQueryComponents`
  - handleComponentsWithRemovedQueries. For each staticQueryComponent, if passed in queries doesn't include `staticQueryComponent.componentPath`. TODO: Where is StaticQueryComponent created? TODO: Where is queries passed into `handleComponentsWithRemovedQueries`?

  TODO: Finish above
