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

Static queries differ from Gatsby page queries in a number of ways. One example is that Gatsby is capable of handling queries with variables for pages because of its awareness of page context while generating them. Doing the same for queries inside of specific components is not yet possible, which is where static queries are used. That means data fetched won't be dynamic (hence the name "static" query).

_For more information on the practical differences in usage between static and normal queries, refer to the guide on [static query](/docs/static-query/#how-staticquery-differs-from-page-query). This guide discusses the implementation differences in how they are handled internally by Gatsby_

## The `staticQueryComponents` and `components` Redux stores

Gatsby stores the queries from your site in Redux stores called `components` and `staticQueryComponents`. This process and a flowchart illustrating it are explained in the [query extraction](/docs/query-extraction/#store-queries-in-redux) guide.

In Redux, `staticQueryComponents` is a `Map` from component `jsonName` to `StaticQueryObject`. An example entry in that data structure looks like this:

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

In the example above, `blog-2018-07-17-announcing-gatsby-preview-995` is the key, with the object as its value in the `Map`.

The `staticQueryComponents` Redux namespace is owned by the `static-query-components.js` reducer which reacts to `REPLACE_STATIC_QUERY` actions. It is created in `query-watcher.js` and called in [`websocket-manager.js`](https://github.com/gatsbyjs/gatsby/blob/610b5812a815f9ecff422e9087c851cd103c8e7e/packages/gatsby/src/utils/websocket-manager.js#L85) to watch for updates to queries while you are developing, and add new data to your cache when queries change.

## Other related internal methods using static queries

The `getQueriesSnapshot` function returns a `Map` with a snapshot of both the `staticQueryComponents` and `components` that holds all queries from Redux to watch.

The `handleComponentsWithRemovedQueries` function removes static queries from Redux when they no longer have a query associated with them. This derives from any staticQueryComponent which doesn't have a `componentPath` on it.
