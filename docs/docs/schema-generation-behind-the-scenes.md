---
title: Schema Generation
---

## Build-node-types

Once the nodes have been sourced and transformed, the next step is to generate the GraphQL Schema. This is one of the more complex parts of the Gatsby code base. We must infer a GraphQL schema from all the nodes that have been sourced and transformed so far. Read on to find out how that occurs.

### 1. Group all nodes by type

Each sourced or transformed node has a `node.internal.type`, which is set by the plugin that created it. E.g, the `source-filesystem` plugin [sets the type to File](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-filesystem/src/create-file-node.js#L46). The `transformer-json` plugin creates a dynamic type [based on the parent node](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-transformer-json/src/gatsby-node.js#L48). E.g `PostsJson` for a `posts.json` file.

During the schema generation phase, we must generate what's called a `ProcessedNodeType` in Gatsby. This is a simple structure that builds on top of a [graphql-js GraphQLObjectType](https://graphql.org/graphql-js/type/#graphqlobjecttype). Our goal in the below steps is to infer and construct this object for each unique node type in redux. 

The flow is summarized by the below graph. It shows the intermediate transformations that are performed by various files in the [schema folder](TODO), finally resulting in the `ProcessedNoteType`. The below transformations occur for each of the uniq `internal.type` values.

```dot
digraph graphname {
  "pluginFields" [ label = "custom plugin fields\l{\l    publicURL: {\l        type: GraphQLString,\l        resolve(file, a, c) { ... }\l    }\l}\l ", shape = box ];
  "typeNodes" [ label = "all redux nodes of type\le.g internal.type === `File`", shape = "box" ];
  "exampleValue" [ label = "exampleValue\l{\l    relativePath: `bogs/my-blog.md`,\l    accessTime: 8292387234\l}\l ", shape = "box" ];
  "resolve" [ label = "ProcessedNodeType.resolve()", shape = box ];
  "gqlType" [ label = "gqlType (GraphQLObjectType)\l{\l    fields,\l    name: `File`\l}\l ", shape = box ];
  "parentChild" [ label = "Parent/Children fields\lnode {\l    childMarkdownRemark { html }\l    parent { id }\l}\l ", shape = "box" ];
  "objectFields" [ label = "Object node fields\l  node {\l    relativePath,\l    accessTime   }\l  }\l  ", shape = "box" ];
  "inputFilters" [ label = "InputFilters\lfile({\l    relativePath: {\l        eq: `blogs/my-blog.md`\l    }\l})\l ", shape = box ]

  "pluginFields" -> "inputFilters";
  "pluginFields" -> "gqlType";
  "objectFields" -> "gqlType";
  "parentChild" -> "gqlType"
  "gqlType" -> "inputFilters";
  "typeNodes" -> "exampleValue";
  "typeNodes" -> "parentChild";
  "typeNodes" -> "resolve";
  "exampleValue" -> "objectFields";
  "inputFilters" -> "resolve";
  "gqlType" -> "resolve";
}
```

### 2. Plugins create custom fields

Gatsby infers GraphQL Types from the fields on the sourced and transformed nodes. But before that, we allow plugins to create their own custom fields. For example, `source-filesystem` creates a [publicURL](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-filesystem/src/extend-file-node.js#L11) field that when resolved, will copy the file into the `public/static` directory and return the new path.

To declare custom fields, plugins implement the [setFieldsOnGraphQLNodeType](/docs/node-apis/#setFieldsOnGraphQLNodeType) API and apply the change only to types that they care about (e.g source-filesystem [only proceeds if type.name = `File`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-filesystem/src/extend-file-node.js#L6). During schema generation, Gatsby will call this API, allowing the plugin to declare these custom fields, [which are returned](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/schema/build-node-types.js#L151) to the main schema process.

### Create a "GQLType"

This step is quite complex, but at its most basic, it infers GraphQL Fields by constructing an `exampleObject` that merges all fields of the type in Redux. It uses this to infer all possible fields and their types, and construct GraphQL versions of them. It does the same for fields created by plugins (like in step 2). This step is explained in detail in [GraphQL Node Types Creation](TODO).

### Create Input filters

This step creates GraphQL input filters for each field so the objects can be queried by them. More details in [schema-input-gql](TODO).

### ProcessedTypeNode creation with resolve implementation

Finally, we have everything we need to construct our final Gatsby Type object (known as `ProcessedTypeNode`). This contains the args and gqlType created above, and implements a resolve function for it using sift. More detail in the [GraphQL Queries over redux](TODO) section.

TODO: Mention how the terminology can get confusing here. Fields, objects, inputs, etc.

### ThirdParty Schema

TODO

TODO: What is elemMatch?

