---
title: Query Extraction
---

### Extracting Queries from Files

Up until now, we have [sourced all nodes](/docs/node-creation-behind-the-scenes/) into redux, [inferred a schema](/docs/schema-generation-behind-the-scenes/) from them, and [created all pages](/docs/page-creation/). The next step is to extract and compile all graphql queries from our source files. The entrypoint to this phase is [query-watcher extractQueries()](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/query-watcher.js), which immediately compiles all graphql queries by calling into [query-compiler.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/query-compiler.js). 

#### Query Compilation

The first thing it does is use [babylon-traverse](https://babeljs.io/docs/en/next/babel-traverse.html) to load all javascript files in the site that have graphql queries in them. This produces AST results that are passed to the [relay-compiler](https://facebook.github.io/relay/docs/en/compiler-architecture.html). This accomplishes a couple of things:

1. It informs us of any malformed queries, which are promptly reported back to the user.
1. It builds a tree of queries and fragments they depend on. And outputs a single optimized query string with the fragments.

After this step, we will have a map of file paths (of site files with queries in them) to Query Objects, which contain the raw optimized query text, as well as other metadata such as the component path and page `jsonName`. The following diagram shows the flow involved during query compilation

```dot
digraph {
  fragments [ label = "fragments. e.g\l.cache/fragments/fragment1.js", shape = cylinder ];
  srcFiles [ label = "source files. e.g\lsrc/pages/my-page.js", shape = cylinder ];
  components [ label = "redux.state.components\l(via createPage)", shape = cylinder ];
  fileQueries [ label = "files with queries", shape = box ];
  babylon [ label = "parse files with babylon\lfilter those with queries" ];
  queryAst [ label = "QueryASTs", shape = box ];
  schema [ label = "Gatsby schema", shape = cylinder ];
  relayCompiler [ label = "Relay Compiler" ];
  queries [ label = "{ Queries | { filePath | <query> query } }", shape = record ];
  query [ label = "{\l    name: filePath,\l    text: rawQueryText,\l    originalText: original text from file,\l    path: filePath,\l    isStaticQuery: if it is,\l    hash: hash of query\l}\l ", shape = box ];
  
  
  fragments -> fileQueries;
  srcFiles -> fileQueries;
  components -> fileQueries;
  fileQueries -> babylon;
  babylon -> queryAst;
  queryAst -> relayCompiler;
  schema -> relayCompiler;
  relayCompiler -> queries;
  queries:query -> query;
}
```

#### Store Queries in Redux

We're now in the [handleQuery](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/query-watcher.js#L68) function.

If the query is a `StaticQuery`, we call the `replaceStaticQuery` action to save it to to the `staticQueryComponents` namespace which is a mapping from a component's path to an object that contains the raw GraphQL Query amonst other things. More details in [Static Queries](/docs/behind-the-scenes-static-vs-normal-queries/). We also remove component's `jsonName` from the `components` redux namespace. See [Component/Page dependencies](/docs/behind-the-scenes-dependencies/). 

If the query is just a normal every day query (not StaticQuery), then we update its component's `query` in the redux `components` namespace via the `replaceComponentQuery` action.

#### Queue for execution

Now that we've saved our query, we're ready to queue it for execution. Query execution is mainly handled by [page-query-runner.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/page-query-runner.js), so we accomplish this by passing the component's path to `queueQueryForPathname` function.

Now let's learn about [Query Execution](/docs/behind-the-scenes-query-execution/).

