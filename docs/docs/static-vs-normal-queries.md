---
title: Static vs Normal Queries
---

## TODO Difference between normal and Static Queries

Static Queries don't need to get run for each page. Just once

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

- [websocket-manager](TODO). TODO
- [query-watcher](TODO).

  - `getQueriesSnapshot` returns map with snapshot of `state.staticQueryComponents`
  - handleComponentsWithRemovedQueries. For each staticQueryComponent, if passed in queries doesn't include `staticQueryComponent.componentPath`. TODO: Where is StaticQueryComponent created? TODO: Where is queries passed into `handleComponentsWithRemovedQueries`?

  TODO: Finish above
