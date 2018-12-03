---
title: Query Execution
---

### Query Execution

Query Execution is kicked off by bootstrap by calling [page-query-runner.js runInitialQuerys()](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/page-query-runner.js#L29). The main files involved in this step are:

- [page-query-runner.js](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby/src/internal-plugins/query-runner/query-queue.js)
- [query-queue.js](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby/src/internal-plugins/query-runner/query-queue.js)
- [query-runner.js](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby/src/internal-plugins/query-runner/query-runner.js)

Here's an overview of how it all relates:

```dot
digraph {
  compound = true;

  subgraph cluster_other {
    style = invis;
    extractQueries [ label = "query-watcher.js", shape = box ];
    componentsDD [ label = "componentDataDependencies\l(redux)", shape = cylinder ];
    components [ label = "components\l (redux)", shape = cylinder ];
    createNode [ label = "CREATE_NODE action", shape = box ];
  }

  subgraph cluster_pageQueryRunner {
    label = "page-query-runner.js"

    dirtyActions [ label = "dirtyActions", shape = cylinder ];
    extractedQueryQ [ label = "queueQueryForPathname()", shape = box ];
    findIdsWithoutDD [ label = "findIdsWithoutDataDependencies()", shape = box ];
    findDirtyActions [ label = "findDirtyActions()", shape = box ];
    queryJobs [ label = "runQueriesForPathnames()", shape = box ];

    extractedQueryQ -> queryJobs;
    findIdsWithoutDD -> queryJobs;
    dirtyActions -> findDirtyActions [ weight = 100 ];
    findDirtyActions -> queryJobs;
  }

  subgraph cluster_queryQueue {
    label = "query-queue.js";
    queryQ [ label = "better-queue", shape = box ];
  }

  subgraph cluster_queryRunner {
    label = "query-runner.js"
    graphqlJs [ label = "graphqlJs(schema, query, context, ...)" ];
    result [ label = "Query Result" ];

    graphqlJs -> result;
  }

  diskResult [ label = "/public/static/d/${dataPath}", shape = cylinder ];
  jsonDataPaths [ label = "jsonDataPaths\l(redux)", shape = cylinder ];

  result -> diskResult;
  result -> jsonDataPaths;

  extractQueries -> extractedQueryQ;
  componentsDD -> findIdsWithoutDD;
  components -> findIdsWithoutDD;
  createNode -> dirtyActions;

  queryJobs -> queryQ [ lhead = cluster_queryQueue ];

  queryQ -> graphqlJs [ lhead = cluster_queryRunner ];
}
```

#### Figuring out which queries need to be executed

The first thing this query does is figure out what queries even need to be run. You would think this would simply be a matter of running the Queries that were enqueued in [Extract Queries](/docs/query-extraction/), but matters are complicated by support for `gatsby develop`. Below is the logic for figuring out which queries need to be executed (code is in [runQueries()](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/page-query-runner.js#L36)).

##### Already queued queries

All queries queued after being extracted (from `query-watcher.js`).

##### Queries without node dependencies

All queries whose component path isn't listed in `componentDataDependencies`. As a recap, in [Schema Generation](/docs/schema-generation/), we showed that all Type resolvers record a dependency between the page whose query we're running and any nodes that were successfully resolved. So, If a component is declared in the `components` redux namespace (occurs during [Page Creation](/docs/page-creation/)), but is _not_ contained in `componentDataDependencies`, then by definition, the query has not been run. Therefore we need to run it. Checkout [Page -> Node Dependencies](/docs/page-node-dependencies/) for more info. The code for this step is in [findIdsWithoutDataDependencies](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/page-query-runner.js#L89).

##### Pages that depend on dirty nodes

In `gatsby develop` mode, every time a node is created, or is updated (e.g via editing a markdown file), we add that node to the [enqueuedDirtyActions](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/page-query-runner.js#L61) collection. When we execute our queries, we can lookup all nodes in this collection and map them to pages that depend on them (as described above). These pages' queries must also be executed. In addition, this step also handles dirty `connections` (see [Schema Connections](/docs/schema-connections/)). Connections depend on a node's type. So if a node is dirty, we mark all connection nodes of that type dirty as well. The code for this step is in [findDirtyIds](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/page-query-runner.js#L171). _Note: dirty ids is really talking about dirty paths_.

#### Queue Queries for Execution

We now have the list of all pages that need to be executed (linked to their Query information). Let's queue them for execution (for realz this time). A call to [runQueriesForPathnames](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/page-query-runner.js#L21) kicks off this step. For each page or static query, we create a Query Job that looks something like:

```javascript
{
  id: // page path, or static query hash
  hash: // only for static queries
  jsonName: // jsonName of static query or page
  query: // raw query text
  componentPath: // path to file where query is declared
  isPage: // true if not static query
  context: {
    path: // if staticQuery, is jsonName of component
    ...page // page object. Not for static queries
    ...page.context // not for static queries
  }
}
```

This Query Job contains everything we need to execute the query (and do things like recording dependencies between pages and nodes). So, we push it onto the queue in [query-queue.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/query-queue.js) and then wait for the queue to empty. Let's see how `query-queue` works.

#### Query Queue Execution

[query-queue.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/query-queue.js) creates a [better-queue](https://www.npmjs.com/package/better-queue) queue that offers advanced features like parallel execution, which is handy since queries do not depend on each other so we can take advantage of this. Every time an item is consumed from the queue, we call [query-runner.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/query-runner.js) where we finally actually execute the query!

Query execution involves calling the [graphql-js](https://graphql.org/graphql-js/) library with 3 pieces of information:

1. The Gatsby schema that was inferred during [Schema Generation](/docs/schema-generation/).
1. The raw query text. Obtained from the Query Job.
1. The Context, also from the Query Job. Has the page's `path` amongst other things so that we can record [Page -> Node Dependencies](/docs/page-node-dependencies/).

Graphql-js will parse the query, and executes the top level query. E.g `allMarkdownRemark( limit: 10 )` or `file( relativePath: { eq: "blog/my-blog.md" } )`. These will invoke the resolvers defined in [Schema Connections](/docs/schema-connections/) or [GQL Type](/docs/schema-gql-type/), which both use sift to query over all nodes of the type in redux. The result will be passed through the inner part of the graphql query where each type's resolver will be invoked. The vast majority of these will be `identity` functions that just return the field value. Some however could call a [custom plugin field](/docs/schema-gql-type/#plugin-fields) resolver. These in turn might perform side effects such as generating images. This is why the query execution phase of bootstrap often takes the longest.

Finally, a result is returned.

#### Save Query results to redux and disk

As queries are consumed from the queue and executed, their results are saved to redux and disk for consumption later on. This involves converting the result to pure JSON, and then saving it to its [dataPath](/docs/behind-the-scenes-terminology/#datapath). Which is relative to `public/static/d`. The data path includes the jsonName and hash. E.g: for the page `/blog/2018-07-17-announcing-gatsby-preview/`, the queries results would be saved to disk as something like:

```
/public/static/d/621/path---blog-2018-07-17-announcing-gatsby-preview-995-a74-dwfQIanOJGe2gi27a9CLKHjamc.json
```

For static queries, instead of using the page's jsonName, we just use a hash of the query.

Now we need to store the association of the page -> the query result in redux so we can recall it later. This is accomplished via the [json-data-paths](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/redux/reducers/json-data-paths.js) reducer which we invoke by creating a `SET_JSON_DATA_PATH` action with the page's jsonName and the saved dataPath.
