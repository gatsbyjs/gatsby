---
title: GraphQL Node Types Creation
---

Gatsby creates a [GraphQLObjectType](TODO) for each distinct `node.internal.type` that is created during the source-nodes phase. Find out below how this is done.

## GraphQL Types for each type of node

When running a GraphQL query, there are a variety of fields that you will want to query. Let's take an example, say we have the below query:

```graphql
  query {
    file( relativePath: {  eq: `blogs/2018-08-23/announcing-v2.md` } ) {
      frontmatter: {
        title
      }
    }
  }
```

When GraphQL runs, it will query all `markdownRemark` nodes by the wordcount expression and return a node that satisfied the query. Then, it will filter down the fields to return by the inner expression. I.e `{ frontmatter: { title } }`. It is the schema that allows the filtering that this section deals with. The creation of the query arguments is dealt with by [schema-gql-input](TODO).

During the [source-nodes](TODO) phase, let's say that [gatsby-source-filesystem](TODO) ran and created a bunch of File nodes. Then, different transformers react via [onCreateNode](TODO), resulting in children of different `node.internal.type`s being created. 

When querying the File nodes, there are 3 categories of fields that we'll be querying:

- Fields on the node object. E.g

```graphql
node {
  relativePath,
  extension,
  size,
  accessTime
}
```

- Child/Parent. E.g:

```graphql
node {
  childMarkdownRemark,
  childrenPostsJson,
  children,
  parent
}
```

- fields created by plugins

```graphql
node {
  publicURL
}
```
    
## gqlType Creation

The Gatsby term for the GraphQLObjectType for a unique node type, is `gqlType`. GraphQLObjectTypes are simply objects that define the type name and fields. The field definitions are created by the [createNodeFields](TODO) function in `build-node-types.js`.

An important thing to note is that all gqlTypes are created before their fields are inferred. This allows fields to be of types that haven't yet been created due to their order of compilation. This is accomplished by the use of `fields` [being a function](TODO).

The first step in inferring GraphQL Fields is to generate an `exampleValue`. It is the result of merging all fields of all nodes of the type in question. This `exampleValue` will therefore contain all potential field names and values, which allows us to infer each field's types. The logic to create this exampleValue is in [getExampleValues](TODO).

With the exampleValue in hand, we can use each of its key/values to infer the Type's fields (broken down by the 3 categories above).

### Object Node Fields

Fields on the node that were created directly by the source and transform plugins. E.g for `File` type, these would be `relativePath`, `size`, `accessTime` etc.

The creation of these fields is handled by the [inferObjectStructureFromNodes](TODO) function in `infer-graphql-type.js`. Given an object, a field could be in one of 3 sub-categories:

1. It involves a mapping in [gatsby-config.js](TODO)
2. It's value is a foreign key refernce to some other node (ends in `___NODE`)
3. It's a plain object or value (e.g String, number, etc)

#### Mapping field

Mappings are explained in the [gatsby-config.js docs](TODO). If the object field we're generating a GraphQL type for is configured in the gatsby-config mapping, then we handle it specially.

Imagine our top level Type we're currently generating fields for is `MarkdownRemark.frontmatter`. And the field we are creating a GraphQL field for is called `author`. And, that we have a mapping setup of:

```javascript
mapping: {
  "MarkdownRemark.frontmatter.author": `AuthorYaml.name`,
},
```

The field generaton in this case is handled by [inferFromMapping](TODO). The first step is to find the type that is mapped to. In this case, `AuthorYaml`. This is known as the `linkedType`. That type will have a field to link by. In this case `name`. If one is not supplied, it defaults to `id`. This field is known as `linkedField`

Now we can create a GraphQL Field declaration whose type is `AuthorYaml` (which we look up in list of other `gqlTypes`). The field resolver will get the value for the node (in this case, the author string), and then search through the react nodes till it finds one whose type is `AuthorYaml` and whose `name` field matches the author string.

#### Foreign Key reference (`___NODE`)

If not a mapping field, it might instead end in `___NODE`, signifying that its value is an ID that is actually a foreign key reference to another node in redux. Check out the [source-plugin docs](TODO) for how this works from a user point of view. Behind the scenes, the field inference is handled by [inferFromFieldName](TODO). 

This is actually quite similar to the mapping case above. We remove the `___NODE` part of the field name. E.g `author___NODE` would become `author`. Then, we find our `linkedNode`. I.e given the example value for `author` (which would be an ID), we find its actual node in redux. Then, we find its type in processed types by its `internal.type`. Note, that also like in mapping fields, we can define the `linkedField` too. This can be specified via `nodeFieldname___NODE___linkedFieldName`. E.g for `author___NODE___name`, the linkedField would be `name` instead of `id`.

Now we can return a new GraphQL Field object, whose type is the one found above. Its resolver searches through all redux nodes until it finds one with the matching ID. As usual, it also creates a [page dependency](TODO), from the query context's path to the node ID.

If the foreign key value is an array of IDs, then instead of returning a Field declaration for a single field, we return a `GraphQLUnionType`, which is a union of all the distinct linked types in the array. 



#### Plain object or value field

If the field was not handled as a mapping or foreign key reference, then it must be a normal every day field. E.g a scalar, string, or plain object. These cases are handled by [inferGraphQLType](TODO).

The core of this step creates a GraphQL Field object, where the type is inferred directly via the result of `typeof`. E.g `typeof(value) === 'boolean'` would result in type `GraphQLBoolean`. Since these are simple values, resolvers are not defined (graphql-js takes care of that for us).

If however, the value is an object or array, we recurse, using [inferObjectStructureFromNodes](TODO) to create the GraphQL fields.

in addition, if a value is a string that actually points to a file, then we hand off field inference to [types/file-type](TODO) (TODO: Dive into why). The same goes for Strings that look like dates. These are handled by [types/date-type](TODO)

### Child/Parent fields

#### Child fields creation

Let's say we're creating a type for `File`. There are many transformer plugins that implement `onCreateNode` for `File` nodes. These produce `File` children that are of their own type. E.g `markdownRemark`, `postsJson`. 

Gatsby stores these children in redux as IDs in the parent's `children` field. And then stores those child nodes as full redux nodes themselves (see [node creation for more](TODO)). E.g for a File node with two children, it will be stored in the redux `nodes` namespace as:

```javascript
{ 
  `id1`: { type: `File`, children: [`id2`, `id3`], ...other_fields },
  `id2`: { type: `markdownRemark`, ...other_fields },
  `id3`: { type: `postsJson`, ...other_fields }
}
```

An important note here is that we do not store a distinct collection of each type of child. Rather we store a single collection that they're all packed into. The benefit of this is that we can easily create a `File.children` field that returns all children, regardless of type. The downside is that the creation of fields such as `File.childrenMarkdownRemark` and `File.childrenPostsJson` is more complicated. This is what [build-node-types](TODO) does.

Another convenience Gatsby provides is the ability to query a node's `child` or `children`, depending on whether a parent node has 1 or more children of that type. This inference is also made by `build-node-types`.

#### child resolvers

When defining our parent `File` gqlType, [build-node-types](TODO) will iterate over the distinct types of its children, and create their fields. Let's say one of these child types is `markdownRemark`. Let's assume there is only one `markdownRemark` child per `File`. Therefore, its field name is `childMarkdownRemark`. Now, we must create its graphql Resolver.

```
resolve(node, args, context, info)
```

The resolve function will be called when we eventually are running queries for our pages. A query might look like:

```graphql
  query {
    allFile {
      edges {
        node {
          childMarkdownRemark { title }
        }
      }
    }
  }
```

To resolve `node.childMarkdownRemark`, we filter over all the node's (that we're resolving) `children`, until we find one of type `markdownRemark`, which is returned. Remember that in redux, `children` is a collection of IDs. So as part of this, we lookup the node by ID in redux too.

But before we return from the resolve function, remember that we might be running this query within the context of a page. If that's the case, then whenever the node changes, the page will need to be rerendered. To record that fact, we call call [createPageDependency](TODO) with the node ID and the page, which is a field in the `context` object in the resolve function signature.

#### parent field

When a node is created as a child of some node, that fact is stored as a `parent` field on the redux node whose value is the ID of the parent. The parent GraphQL field resolver simply looks up the resolving node's `parent` field, and then looks up the parent in the redux `nodes` namespace map. It also creates a [page dependency](TODO have this in own section), as is done by child resolvers.

### Plugin fields

These are fields created by plugins that implement the [setFieldsOnGraphQLNodeType](TODO) API. These plugins return full GraphQL Field declarations, complete with type and resolve functions. 

## TODO GQLType related to Schema/connections

#### NOTES

TODO: If haven't already. Talk about how all the field generation occurs after we've defined all the gqlTypes themselves first.

TODO wat is linkedField??
--------

TODO: Add to section where links between node and path are created. build-node-types.js:56. 

