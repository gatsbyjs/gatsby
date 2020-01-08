---
title: Querying with Sift
---

> This documentation isn't up to date with the latest version of Gatsby.
>
> The [schema customization](/docs/schema-customization) and [node materialisation](https://github.com/gatsbyjs/gatsby/pull/16091) features have both made changes to this part of Gatsby.
>
> You can help by making a PR to [update this documentation](https://github.com/gatsbyjs/gatsby/issues/14228).

## Summary

Gatsby stores all data loaded during the source-nodes phase in Redux. And it allows you to write GraphQL queries to query that data. But Redux is a plain JavaScript object store. So how does Gatsby query over those nodes using the GraphQL query language?

The answer is that it uses the [sift.js](https://github.com/crcn/sift.js/tree/master) library. It is a port of the MongoDB query language that works over plain JavaScript objects. It turns out that mongo's query language is very compatible with GraphQL.

Most of the logic below is in the [run-sift.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/redux/run-sift.js) file, which is called from the [ProcessedNodeType `resolve()`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/schema/build-node-types.js#L191) function.

## ProcessedNodeType Resolve Function

Remember, at the point this resolve function is created, we have been iterating over all the distinct `node.internal.type`s in the redux `nodes` namespace. So for instance we might be on the `MarkdownRemark` type. Therefore the `resolve()` function closes over this type name and has access to all the nodes of that type.

The `resolve()` function calls `run-sift.js`, and provides it with the following arguments:

- GraphQLArgs (as JavaScript object). Within a filter. E.g. `wordcount: { paragraphs: { eq: 4 } }`
- All nodes in redux of this type. E.g. where `internal.type == MmarkdownRemark'`
- Context `path`, if being called as part of a [page query](/docs/query-execution/#query-queue-execution)
- typeName. E.g. `markdownRemark`
- gqlType. See [more on gqlType](/docs/schema-gql-type)

For example:

```javascript
runSift({
  args: {
    filter: { // Exact args from GraphQL Query
      wordcount: {
        paragraphs: {
          eq: 4
        }
      }
    }
  },
  nodes: ${latestNodes},
  path: context.path, // E.g. /blogs/my-blog
  typeName: `markdownRemark`,
  type: ${gqlType}
})
```

## Run-sift.js

This file converts GraphQL Arguments into sift queries and applies them to the collection of all nodes of this type. The rough steps are:

1.  Convert query args to sift args
1.  Drop leaves from args
1.  Resolve inner query fields on all nodes
1.  Track newly realized fields
1.  Run sift query on all nodes
1.  Create Page dependency if required

### 1. Convert query args to sift args

Sift expects all field names to be prepended by a `$`. The [siftifyArgs](https://github.com/gatsbyjs/gatsby/blob/6dc8a14f8efc78425b1f225901dce7264001e962/packages/gatsby/src/redux/run-sift.js#L39) function takes care of this. It descends the args tree, performing the following transformations for each field key/value scenario.

- field key is`elemMatch`? Change to `$elemMatch`. Recurse on value object
- field value is regex? Apply regex cleaning
- field value is glob, use [minimatch](https://www.npmjs.com/package/minimatch) library to convert to Regex
- normal value, prepend `$` to field name.

So, the above query would become:

```javascript
{
  `$wordcount`: {
    `$paragraphs`: {
      `$eq`: 4
    }
  }
}
```

### 2. Drop leaves (e.g. `{eq: 4}`) from args

To assist in step 3, we create a version of the siftified args called `fieldsToSift` that has all leaves of the args tree replaced with boolean `true`. This is handled by the [extractFieldsToSift](https://github.com/gatsbyjs/gatsby/blob/6dc8a14f8efc78425b1f225901dce7264001e962/packages/gatsby/src/redux/run-sift.js#L65) function. `fieldsToSift` would look like this after the function is applied:

```javascript
{
  `wordcount`: {
    `paragraphs`: true
  }
}
```

### 3. Resolve inner query fields on all nodes

Step 4 will perform the actual sift query over all the nodes, returning the first one that matches the query. But we must remember that the nodes that are in redux only include data that was explicitly created by their source or transform plugins. If instead of creating a data field, a plugin used `setFieldsOnGraphQLNodeType` to define a custom field, then we have to manually call that field's resolver on each node. The args in step 2 is a great example. The `wordcount` field is defined by the [gatsby-transformer-remark](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-transformer-remark/src/extend-node-type.js#L416) plugin, rather than created during the creation of the remark node.

The [nodesPromise](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/redux/run-sift.js#L168) function iterates over all nodes of this type. Then, for each node, [resolveRecursive](https://github.com/gatsbyjs/gatsby/blob/6dc8a14f8efc78425b1f225901dce7264001e962/packages/gatsby/src/redux/run-sift.js#L135) descends the `siftToFields` tree, getting the field name, and then finding its gqlType, and then calling that type's `resolve` function manually. E.g, for the above example, we would find the gqlField for `wordcount` and call its resolve field:

```javascript
markdownRemarkGqlType.resolve(node, {}, {}, { fieldName: `wordcount` })
```

Note that the graphql-js library has NOT been invoked yet. We're instead calling the appropriate gqlType resolve function manually.

The resolve method in this case would return a paragraph node, which also needs to be properly resolved. So We descend the `fieldsToSift` arg tree and perform the above operation on the paragraph node (using the found paragraph gqlType).

After `resolveRecursive` has finished, we will have "realized" all the query fields in each node, giving us confidence that we can perform the query with all the data being there.

### 4. Track newly realized fields

Since new fields on the node may have been created in this process, we call `trackInlineObjectsInRootNode()` to track these new objects. See [Node Tracking](/docs/node-tracking/) docs for more.

### 5. Run sift query on all nodes

Now that we've realized all fields that need to be queried, on all nodes of this type, we are finally ready to apply the sift query. This step is handled by [tempPromise](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/redux/run-sift.js#L214). It simply concatenates all the top level objects in the args tree together with a sift `$and` expression, and then iterates over all nodes returning the first one that satisfies the sift expression.

In the case that `connection === true` (argument passed to run-sift), then instead of just choosing the first argument, we will select ALL nodes that match the sift query. If the GraphQL query specified `sort`, `skip`, or `limit` fields, then we use the [graphql-skip-limit](https://www.npmjs.com/package/graphql-skip-limit) library to filter down to the appropriate results. See [Schema Connections](/docs/schema-connections) for more info.

### 6. Create Page dependency if required

Assuming we find a node (or multiple if `connection` === true), we finish off by recording the page that initiated the query (in the `path` field) depends on the found node. More on this in [Page -> Node Dependencies](/docs/page-node-dependencies/).

## Note about plugin resolver side effects

As [mentioned above](#3-resolve-inner-query-fields-on-all-nodes), `run-sift` must "realize" all query fields before querying over them. This involves calling the resolvers of custom plugins on **each node of that type**. Therefore, if a resolver performs side effects, then these will be triggered, regardless of whether the field result actually matches the query.
