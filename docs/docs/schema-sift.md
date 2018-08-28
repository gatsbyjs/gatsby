---
title: GraphQL Queries over redux
---

## Summary

Gatsby stores all data loaded during the source-nodes phase in redux. And it allows you to write GraphQL queries to query that data. But Redux is a plain javascript object store. So how does Gatsby query over those nodes using the GraphQL Query language?

The answer is that it uses the [sift.js](TODO) library. It is a port of the MongoDB query language that works over plain javascript objects. The logic for this is in the [run-sift.js](TODO) file, which is called from the [ProcessedNodeType] `resolve()` function. 

TODO: Mention this is different from `allTypeFields`. This just finds one result.

## ProcessedNodeType Resolve Function

Remember, at the point this resolve function is created, we have been iterating over all the distinct `internal.node.type`s in the redux `nodes` namespace. So for instance we might be on the `markdownRemark` type. Therefore the `resolve()` function closes over this type name. 

The `resolve()` function calls `run-sift`, and provides it with the following arguments:

- GraphQLArgs (as js object). Within a filter. E.g `wordcount: { paragraphs: { eg: 4 } }`
- All nodes in redux of this type. E.g where `internal.type == 'markdownRemark'`
- Context `path`, if present
- typeName. E.g `markdownRemark`
- gqlType. See [more on gqlType](TODO)

For example:

```javascript
{
  args: {
    filter: { // Exact args from GraphQL Query
      wordcount: {
        paragraphs: {
          eg: 4
        }
      }
    }
  },
  nodes: ${latestNodes},
  path: context.path, // E.g /blog/2018-08-23/introducing-v2
  typeName: `markdownRemark`,
  type: ${gqlType}
}
```

## Run-sift.js

This file converts GraphQL Arguments into sift queries and applies them to the collection of all nodes of this type. The rough steps are:

1. Convert query args to sift args
1. Drop leaves from args
1. Resolve inner query fields on all nodes
1. Track newly realized fields
1. Run sift query on all nodes
1. Create Page dependency if required


### 1. Convert query args to sift args

Sift expects all field names to be prepended by a `$`. The [siftify-args](TODO) function takes care of this. It descends the args tree, performing the following transformations for each field key/value scenario.

- field key is`elemMatch`? Change to `$elemMatch`. Recurse on value object
- field value is regex? Apply regex cleaning
- field value is globl, use [minimatch](TODO) library to convert to Regex
- normal value, prepend `$` to field name.

So, the above query would become:

```javascript
{
  `$wordcount`: {
    `$paragraphs`: {
      `$eg`: 4
    }
  }
}
```

### 2. Drop leaves (e.g `{eq: 4}`) from args

To assist in step 3, we create a version of the siftified args called `fieldsToSift` that has all leaves of the args tree replaced with boolean `true`. This is handled by the [extractFieldsToSift](TODO) function. `fieldsToSift` would look like this after the function is applied:

```javascript
{
  `wordcount`: {
    `paragraphs`: true
  }
}
```

### 3. Resolve inner query fields on all nodes

Step 4 will perform the actual sift query over all the nodes, returning the first one that matches the query. But we must remember that the nodes that are in redux only include data that was explicitly created by their source or transform plugins. If instead of creating a data field, a plugin used `setFieldsOnGraphQLNodeType` to define a custom field (see [gql-type](TODO)), then we have to manually call that field's resolver on each node. The example in step 2 is a great example. The `wordcount` field is defined by the [gatsby-transformer-remark](TODO) plugin, rather than created during the transformation of the remark node.

The [nodesPromise](TODO) function iterates over all nodes of this type. Then, for each node, [resolveRecursive](TODO) descends the `siftToFields` tree, getting the field name, and then finding its gqlType, and then calling that type's `resolve` function manually. E.g, for the above example, we would find the gqlField for `wordcount` and call its resolve field:

```javascript
markdownRemarkGqlType.resolve(node, {}, {}, { fieldName: `wordcount` })
```

Note that the [graphql-js](TODO) library has NOT been invoked yet. We're instead calling the appropriate gqlType resolve function manually. 

The resolve method in this case would return a paragraph node, which also needs to be properly resolved. So We descend the `fieldsToSift` arg tree and perform the above operation on the paragraph node (using the found paragraph gqlType). 

After `resolveRecursive` has finished, we will have "realized" all the query fields in each node, giving us confidence that we can perform the query with all the data being there.

### 4. Track newly inlined fields 

TODO: I think what's going on here is that nodes when created, have explicit objects on them already. And there must be a step that links all these sub objects to the root node. But, the fields that are realized in the above step haven't been created before. So we need to track them explicitly. Feels a bit cray cray, but legit I guess.

TODO: Create proper node tracking doc in other .md

### 5. Run sift query on all nodes

Now that we've realized all fields that need to be queried, on all nodes of this type, we are finally ready to apply the query to all those nodes. This step is handled by [tempPromise](TODO). It simply concatenates all the top level objects in the args tree together with a sift `$and` expression, and then iterates over all nodes returning the first one that satisfies the sift expression.

### 6. Create Page dependency if required

Assuming we find a node, we finish off by recording the page that initiated the query (in the `path` field depends on the found node. More on this in [create page dependency](TODO)

TODO: Due to how it operates over all fields, gets the value, and then applies the query to those results, if plugins perform side effects, won't the all be applied, even if only some nodes actually match query? Shouldn't plugin authors be aware of this?
