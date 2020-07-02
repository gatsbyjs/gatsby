# Gatsby GraphQL Source Toolkit

The toolkit designed to simplify data sourcing from the remote GraphQL API into Gatsby.

Note: this is **not** a source plugin by itself, but it helps [writing custom GraphQL source plugins][1]
by providing a set of convenience tools and conventions.

## Table of contents

- [Why not `gatsby-source-graphql`](#why-not-gatsby-source-graphql)
- [Features](#features)
- [How it works](#how-it-works)
  - [1. Setup remote schema](#1-setup-remote-schema)
  - [2. Configure Gatsby node types](#2-configure-gatsby-node-types)
  - [3. Define fields to be fetched (using GraphQL fragments)](#3-define-fields-to-be-fetched-using-graphql-fragments)
  - [4. Compile sourcing queries](#4-compile-sourcing-queries)
  - [5. Add explicit types to gatsby schema](#5-add-explicit-types-to-gatsby-schema)
  - [6. Source nodes](#6-source-nodes)
- [Sourcing changes (delta)](#sourcing-changes-delta)
- [Automatic Pagination Explained](#automatic-pagination-explained)
- [Configuration](#configuration)
  - [Query executor](#query-executor)
  - [Gatsby field aliases](#gatsby-field-aliases)
  - [Type name transformer](#type-name-transformer)
  - [Custom Pagination Adapter](#custom-pagination-adapter)
- [Tools Reference](#tools-reference)
  - [Configuration Tools](#configuration-tools)
    - [createDefaultQueryExecutor](#createdefaultqueryexecutor)
    - [loadSchema](#loadschema)
    - [buildNodeDefinitions](#buildnodedefinitions)
  - [Query compilation tools](#query-compilation-tools)
    - [generateDefaultFragments](#generatedefaultfragments)
    - [readOrGenerateDefaultFragments](#readorgeneratedefaultfragments)
    - [compileNodeQueries](#compilenodequeries)
  - [Schema customization tools](#schema-customization-tools)
    - [createSchemaCustomization](#createschemacustomization)
  - [Source nodes tools](#source-nodes-tools)
    - [sourceAllNodes](#sourceallnodes)
    - [sourceNodeChanges](#sourcenodechanges)

## Why not `gatsby-source-graphql`?

Historically Gatsby suggested [`gatsby-source-graphql`][2] plugin to consume data from remote GraphQL APIs.

This plugin is easy to use, but it has a significant problem: it doesn't adhere to the original
Gatsby architecture (doesn't [source nodes][3]), which makes data caching impossible.
As a result, it doesn't scale well, and can't work with Gatsby Preview or Incremental Builds by design
([more technical details][4]).

Also, with `gatsby-source-graphql` you can't leverage the power of Gatsby transformer plugins like `gatsby-transformer-remark`
or `gatsby-transformer-sharp` (and it's hard to use with `gatsby-image` as a consequence).

This new toolkit should solve all those issues and implement correct node sourcing for Gatsby.

## Features

- Efficient concurrent data fetching
- Automatic data pagination
- Cache data between runs (supports sourcing delta changes)
- Customize what is sourced
- Schema customization out of the box (no performance penalty of type inference)
- Designed to support [Gatsby Preview][5] and [Incremental Builds][6]

## How it works

Let's imagine we have a GraphQL API located at `https://www.example.com/graphql`.
This example API has the following straightforward schema:

```graphql
type Post {
  id: ID!
  description(truncateAt: Int): String
  author: Author
}

type Author {
  id: ID!
  name: String
  allPosts: [Post]
}

type Query {
  author(id: ID!): Author
  authors(limit: Int = 10, offset: Int = 0): [Author]
  post(id: ID!): Post
  posts(limit: Int = 10, offset: Int = 0): [Post]
}
```

How do we source data from this GraphQL API using the toolkit?
Let's look at the full example and then walk through it step-by-step.

```js
async function createSourcingConfig(gatsbyApi) {
  // Step1. Setup remote schema:
  const execute = createDefaultQueryExecutor(`https://www.example.com/graphql`)
  const schema = await loadSchema(execute)

  // Step2. Configure Gatsby node types
  const gatsbyNodeTypes = [
    {
      remoteTypeName: `Post`,
      remoteIdFields: [`__typename`, `id`],
      queries: `query LIST_POSTS { posts(limit: $limit, offset: $offset) }`,
    },
    {
      remoteTypeName: `Author`,
      remoteIdFields: [`__typename`, `id`],
      queries: `query LIST_AUTHORS { authors(limit: $limit, offset: $offset) }`,
    },
  ]

  // Step3. Provide (or generate) fragments with fields to be fetched
  const fragments = generateDefaultFragments({ schema, gatsbyNodeTypes })

  // Step4. Compile sourcing queries
  const documents = compileNodeQueries({
    schema,
    gatsbyNodeTypes,
    customFragments: fragments,
  })

  return {
    gatsbyApi,
    schema,
    execute,
    gatsbyTypePrefix: `Example`,
    gatsbyNodeDefs: buildNodeDefinitions({ gatsbyNodeTypes, documents }),
  }
}

exports.sourceNodes = async (gatsbyApi, pluginOptions) => {
  const config = await createSourcingConfig(gatsbyApi)

  // Step5. Add explicit types to gatsby schema
  await createSchemaCustomization(config)

  // Step6. Source nodes
  await sourceAllNodes(config)
}
```

Let's take a closer look at every step in this example.

### 1. Setup remote schema

```js
const execute = createDefaultQueryExecutor(`https://www.example.com/graphql`)
const schema = await loadSchema(execute)
```

The toolkit executes GraphQL queries against remote API and so expects you
to provide `execute` function for that. A default implementation is available via
[`createDefaultQueryExecutor`](#createdefaultqueryexecutor) utility.

Also, we are going to perform various kinds of analysis with GraphQL schema and so
expect a `schema` object (an instance of `GraphQLSchema` from `graphql-js` package).

Use [`loadSchema`](#loadschema) to fetch the remote schema and re-construct it locally via GraphQL [introspection][7].

### 2. Configure Gatsby node types

```js
const gatsbyNodeTypes = [
  {
    remoteTypeName: `Post`,
    remoteIdFields: [`__typename`, `id`],
    queries: `query LIST_POSTS { posts(limit: $limit, offset: $offset) }`,
  },
  // ... other node types
]
```

Declare which types of the remote GraphQL API you will treat as Gatsby nodes and provide the necessary configuration for node sourcing and schema customization.

Settings explained:

- `remoteTypeName` is utilized to:

  - Build gatsby node type name as follows: `${gatsbyTypePrefix}${remoteTypeName}` ([customizable](#type-name-transformer)).
  - Discover and resolve relationships between node types in the schema.

- `remoteIdFields` are necessary to:

  - Construct gatsby node id (a concatenation of all remote id fields)
  - Re-fetch individual nodes by `id` (e.g., to support previews and delta sourcing)
  - Resolve node relationships in Gatsby schema customization

- `queries` for node sourcing (without field selections).
  Those are combined with custom fragments for actual data fetching (see the next two steps).

### 3. Define fields to be fetched (using GraphQL fragments)

This step is probably the most important for the whole process.
It enables different workflows with a high granularity of sourcing.

In the example we demonstrate the simplest workflow - [automatic fragments generation](#generatedefaultfragments)
on each run:

```js
const fragments = generateDefaultFragments({ schema, gatsbyNodeTypes })
```

This call generates the following fragments ([customizable](#generatedefaultfragments)):

```graphql
fragment Post on Post {
  id
  description
  author {
    remoteTypeName: __typename
    remoteId: id
  }
}

fragment Author on Author {
  id
  name
  allPosts {
    remoteTypeName: __typename
    remoteId: id
  }
}
```

In [step 4](#4-compile-sourcing-queries) we combine those fragments with `queries` (from [step 2](#2-configure-gatsby-node-types))
to produce final sourcing queries.

But instead of generating them every time, you could have chosen the following workflow (as one of the possible options):

1.  Generate fragments on the very first run and save them somewhere in the `src` folder
2.  Allow developers to edit those fragments in IDE (e.g., to remove fields they don't need, add fields with arguments, etc.)
3.  Load modified fragments from the file system on each run

See [`readOrGenerateDefaultFragments`](#readorgeneratedefaultfragments) utility for something like this.

For example let's modify the `Author` fragment to fetch excerpts of author posts:

```graphql
fragment CustomizedAuthorFragment on Author {
  id
  name
  allPosts {
    excerpt: description(truncateAt: 200)
  }
}
```

We will see how this change affects sourcing queries in the next step.

### 4. Compile sourcing queries

In this step we combine node configurations ([step 2](#2-configure-gatsby-node-types))
with custom fragments ([step 3](#3-define-fields-to-be-fetched-using-graphql-fragments))
and compile final queries for node sourcing:

```js
const documents = compileNodeQueries({
  schema,
  gatsbyNodeTypes,
  customFragments: fragments,
})
```

For our example, the toolkit will compile two documents (for `Post` and `Author` types respectively):

`Post`:

```graphql
query LIST_POSTS($limit: Int, $offset: Int) {
  posts(limit: $limit, offset: $offset) {
    remoteTypeName: __typename
    remoteId: id
    ...Post
    ...CustomizedAuthorFragment__allPosts
  }
}

fragment Post on Post {
  remoteId: id
  description
  author {
    remoteTypeName: __typename
    remoteId: id
  }
}

fragment CustomizedAuthorFragment__allPosts on Post {
  excerpt: description(truncateAt: 200)
}
```

`Author`:

```graphql
query LIST_AUTHORS($limit: Int, $offset: Int) {
  authors(limit: $limit, offset: $offset) {
    remoteTypeName: __typename
    remoteId: id
    ...CustomizedAuthorFragment
  }
}

fragment CustomizedAuthorFragment on Author {
  remoteId: id
  name
  allPosts {
    remoteTypeName: __typename
    remoteId: id
  }
}
```

Note how the `excerpt` field has been moved from `CustomizedAuthorFragment` to the
`CustomizedAuthorFragment__allPosts` in the `Post` document
(and fields from `remoteIdFields` list have been added in its place).

Also, note the toolkit automatically adds field aliases for reserved gatsby fields
(`id`, `internal`, `parent`, `children` and [`__typename` meta field][10])

**Why?** This way we achieve data normalization in Gatsby. All the data belonging
to a node is moved to its specific queries. Queries of other nodes _reference_
nodes of other types (via id fields).

You can write these documents somewhere to disk to ease debugging
(generated queries are static and could be used manually to replicate the error).

### 5. Add explicit types to gatsby schema

```js
await createSchemaCustomization(config)
```

This step utilizes Gatsby [Schema Customization API][8] to describe node types specified in [step 2](#2-configure-gatsby-node-types).

For our example, the toolkit creates the following Gatsby node type definitions:

```graphql
type ExamplePost implements Node @dontInfer {
  id: ID!
  description: String
  excerpt: String
  author: ExampleAuthor
}

type ExampleAuthor implements Node @dontInfer {
  id: ID!
  name: String
  allPosts: [ExamplePost]
}
```

> as well as custom resolvers for `ExamplePost.author` and `ExampleAuthor.allPosts` to resolve relationships

As you may see, the toolkit uses the remote schema as a reference, but it doesn't clone it 1 to 1.

Instead, it takes all the fields from the sourcing query (including aliased fields)
and adds them to Gatsby node type with slight changes:

- every type name is prefixed with `gatsbyTypePrefix` setting (`Post` => `ExamplePost` in our case)
- all field arguments are removed
- type of the field remains semantically the same as in the remote schema

---

**Why?** The primary motivation is to support arbitrary field arguments of the remote schema.

In general the following field definition: `field(arg: Int!)` can't be directly copied
from the remote schema unless we know all usages of `arg` during Gatsby build.

To workaround this problem we ask you to provide those usages in fragments as
aliased fields:

```graphql
fragment MyFragment on RemoteType {
  field(arg: 0)
  alias1: field(arg: 1)
  alias2: field(arg: 2)
}
```

Then we add those `alias1` and `alias2` fields to Gatsby type so that you could access
them in Gatsby's queries.

---

### 6. Source nodes

Here we take all the queries compiled in [step 4](#4-compile-sourcing-queries), execute them
against the remote GraphQL API and transform results to Gatsby nodes using [createNode action][11].

Let's take another look at one of the queries:

```graphql
query LIST_AUTHORS($limit: Int, $offset: Int) {
  authors(limit: $limit, offset: $offset) {
    remoteTypeName: __typename
    remoteId: id
    ...CustomizedAuthorFragment
  }
}

fragment CustomizedAuthorFragment on Author {
  remoteId: id
  name
  allPosts {
    remoteTypeName: __typename
    remoteId: id
  }
}
```

The query has `$limit` and `$offset` variables for pagination (defined in [step 2](#2-configure-gatsby-node-types)).
But where do we get values for those variables?

The toolkit uses variable names to resolve an effective [pagination adapter](#automatic-pagination-explained) which
"knows" how to perform pagination and produce values for those variables.

> In our example it is `LimitOffset` adapter that "knows" how to produce values for `$limit` and `$offset` variables as the toolkit
> loops through pages.

Let's assume we've received a GraphQL result that looks like this:

```json
{
  "authors": [
    {
      "remoteTypeName": "Author",
      "remoteId": "1",
      "name": "Jane",
      "allPosts": [
        { "remoteTypeName": "Post", "remoteId": "1" },
        { "remoteTypeName": "Post", "remoteId": "2" },
        { "remoteTypeName": "Post", "remoteId": "3" }
      ]
    }
  ]
}
```

The toolkit will create a single Gatsby node of type `ExampleAuthor` out of it as-is.
The only difference is that it will add the `id` field and required Gatsby's `internal` fields
as described [in `createNode` docs][11].

## Sourcing changes (delta)

Delta sourcing allows you to keep data sourced in a previous build and fetch only what
has changed since then.

> **Note:** it is only possible if your API allows you to receive
> the list of nodes changed since the last build.

Let's see how it works with [our original example](#how-it-works). First, we need to
modify the config of Gatsby node types from the [step 2](#2-configure-gatsby-node-types)
to support individual node re-fetching:

```diff
const gatsbyNodeTypes = [
  {
    remoteTypeName: `Post`,
    remoteIdFields: [`__typename`, `id`],
-   queries: `query LIST_POSTS { posts(limit: $limit, offset: $offset) }`,
+   queries: `
+       query LIST_POSTS { posts(limit: $limit, offset: $offset) }
+       query NODE_POST { post(id: $id) }
+   `,
  },
  // ... other node types
]
```

When compiling queries on [step 4](#4-compile-sourcing-queries) the toolkit will spread
all of our fragments in both queries, so the shape of the node will be identical when
executing `LIST_POSTS` or `NODE_POST`.

Next, let's modify `sourceNodes` in `gatsby-node.js`:

```js
exports.sourceNodes = async (gatsbyApi, pluginOptions) => {
  const lastBuildTime = await gatsbyApi.cache.get(`LAST_BUILD_TIME`)
  const config = await createSourcingConfig(gatsbyApi)
  await createSchemaCustomization(config)

  if (lastBuildTime) {
    // Source delta changes
    const nodeEvents = await fetchNodeChanges(lastBuildTime)
    await sourceNodeChanges(config, { nodeEvents })
  } else {
    // Otherwise source everything from scratch as usual
    await sourceAllNodes(config)
  }
  await gatsbyApi.cache.set(`LAST_BUILD_TIME`, Date.now())
}
```

The part you will have to implement yourself here is `fetchNodeChanges`.
It should fetch changes from your API and return a list of events in a format the toolkit
understands:

```js
async function fetchNodeChanges(lastBuildTime) {
  // Here we simply return the list of changes but in the real project you will
  // have to fetch changes from your API and transform them to this format:
  return [
    {
      eventName: "DELETE",
      remoteTypeName: "Post",
      remoteId: { __typename: "Post", id: "1" },
    },
    {
      eventName: "UPDATE",
      remoteTypeName: "Post",
      remoteId: { __typename: "Post", id: "2" },
    },
  ]
}
```

As you can see, two kinds of events supported (and thus must be tracked by your backend): `DELETE` and `UPDATE`.

The toolkit only cares about remote IDs of the nodes that have changed:

- for the `UPDATE` event it will re-fetch nodes individually using `NODE_POST` query we defined above
- for the `DELETE` event, it will delete corresponding Gatsby nodes (without further requests to your API).

The `remoteId` field here must contain values for **all** of the `remoteIdFields`
defined in gatsby node config above (in this example: `__typename` and `id`).
They will be passed to the `NODE_POST` query as variables.

## Automatic Pagination Explained

[Pagination][9] is essential for an effective node sourcing. But different GraphQL APIs
implement pagination differently. The toolkit abstracts those differences away by
introducing a concept of "pagination adapter".

Two most common adapters supported out of the box: `LimitOffset` and `RelayForward`
(for [Relay Connections specification][12]).
But you can also [define a custom one](#custom-pagination-adapter).

The toolkit selects which adapter to use based on variable names used in the query:

- `LimitOffset`: when it sees `$limit` and `$offset` variables
- `RelayForward`: when it sees `$first` and `$after` variables

In a nutshell pagination adapter simply "knows" which variable values to use for the
given GraphQL query to fetch the next page of a field.

This way the toolkit can paginate your queries automatically and express the
result as `AsyncIterator` of your nodes for convenience and efficiency.

## Configuration

You can adjust some aspects of sourcing and schema customization by providing a config
object of the following structure (typescript flavour):

```ts
type RemoteTypeName = string

interface ISourcingConfig {
  gatsbyApi: NodePluginArgs
  schema: GraphQLSchema
  gatsbyNodeDefs: Map<RemoteTypeName, IGatsbyNodeDefinition>
  gatsbyTypePrefix: string
  execute: IQueryExecutor

  gatsbyFieldAliases?: { [field: string]: string }
  typeNameTransform?: ITypeNameTransform
  paginationAdapters?: IPaginationAdapter<any, any>[]
}

interface IGatsbyNodeDefinition {
  remoteTypeName: RemoteTypeName
  remoteIdFields: string[]
  document: DocumentNode
  nodeQueryVariables: (id: IRemoteId) => object
}
```

Gatsby node definition is constructed from the node type config ([step 2](#2-configure-gatsby-node-types))
and compiled queries ([step 4](#4-compile-sourcing-queries)) using [`buildNodeDefinitions`](#buildnodedefinitions)
utility.

### Query executor

You can control how the toolkit executes GraphQL queries by providing a custom `execute`
function:

```ts
interface ISourcingConfig {
  // ...
  execute: IQueryExecutor
  // ...
}

export interface IQueryExecutor {
  (args: IQueryExecutionArgs): Promise<ExecutionResult>
}

export interface IQueryExecutionArgs {
  query: string
  operationName: string
  variables: object
  document?: DocumentNode
}

interface ExecutionResult {
  errors?: ReadonlyArray<GraphQLError>
  data?: object
}
```

It can be as simple as this:

```js
const fetch = require("node-fetch")

async function execute({ operationName, query, variables = {} }) {
  const res = await fetch(`https://www.example.com/graphql`, {
    method: "POST",
    body: JSON.stringify({ query, variables, operationName }),
    headers: {
      "Content-Type": "application/json",
    },
  })
  return await res.json()
}

const config = {
  // ... other options
  execute,
}
```

The default implementation [`createDefaultQueryExecutor`](#createdefaultqueryexecutor) is very similar,
except that it also controls query concurrency using an excellent [`p-queue`][13] library.

Use [`wrapQueryExecutorWithQueue`](#wrapqueryexecutorwithqueue) to re-use concurrency logic for
your custom executor.

### Gatsby field aliases

```ts
interface ISourcingConfig {
  // ...
  gatsbyFieldAliases?: { [field: string]: string }
  // ...
}
```

This is just a simple object that defines which aliases to use for internal
Gatsby fields when compiling queries ([step 4](#4-compile-sourcing-queries)).

Default value is:

```js
const defaultGatsbyFieldAliases = {
  __typename: "remoteTypeName",
  id: "remoteId",
  internal: "remoteInternal",
  children: "remoteChildren",
  parent: "remoteParent",
}
```

### Type name transformer

The toolkit must transform type names from the remote schema to Gatsby schema:

```ts
interface ISourcingConfig {
  // ...
  gatsbyTypePrefix: string
  typeNameTransform?: ITypeNameTransform
}

export interface ITypeNameTransform {
  toGatsbyTypeName: (remoteTypeName: string) => string
  toRemoteTypeName: (gatsbyTypeName: string) => string
}
```

Default implementation uses `gatsbyTypePrefix` option and is as simple as:

```js
function createTypeNameTransform(prefix) {
  return {
    toGatsbyTypeName: remoteTypeName => `${prefix}${remoteTypeName}`,
    toRemoteTypeName: gatsbyTypeName => gatsbyTypeName.substr(prefix.length),
  }
}
```

> Note: the toolkit uses this transformer to convert EVERY type name, not only node types.

### Custom Pagination Adapter

```ts
interface ISourcingConfig {
  // ...
  paginationAdapters?: IPaginationAdapter<any, any>[]
}
```

You can add a new (or override existing) adapters by providing you own implementations
conforming to this interface:

```ts
interface IPageInfo {
  variables: { [name: string]: unknown }
  hasNextPage: boolean
}

interface IPaginationAdapter<TPage, TItem> {
  name: string
  expectedVariableNames: string[]
  start(): IPageInfo
  next(current: IPageInfo, page: TPage): IPageInfo
  concat(acc: TPage, page: TPage): TPage
  getItems(page: TPage): Array<TItem | null>
}
```

Check out the `src/config/pagination-adapters` folder for examples.

> Note: when setting `paginationAdapters` option you override built-in adapters completely
> So if you want to be able to still use one of the existing adapters, pass them along with
> your custom adapters:

```js
const { PaginationAdapters } = require("gatsby-graphql-source-toolkit")
const MyCustomAdapter = {
  // Your implementation
}
const config = {
  // ... other options
  paginationAdapters: PaginationAdapters.concat(MyCustomAdapter),
}
```

## Tools Reference

### Configuration Tools

#### createDefaultQueryExecutor

Creates default query executor suitable for [sourcing config](#query-executor):

```ts
function createDefaultQueryExecutor(
  uri: string,
  fetchOptions: FetchOptions,
  queueOptions: PQueueOptions<any, any> = { concurrency: 10 }
): IQueryExecutor
```

This implementation sends GraphQL requests using [`node-fetch`][14]
(see library documentation for all possible `FetchOptions`). It also uses [p-queue][13]
to restrict the number of concurrently executed queries.
Default concurrency level is `10`, try increasing it to achieve higher throughput.

#### wrapQueryExecutorWithQueue

Takes existing query `executor` function and creates a new function with the same signature
that runs with given concurrency level (`10` by default).

```ts
function wrapQueryExecutorWithQueue(
  executor: IQueryExecutor,
  queueOptions: PQueueOptions<any, any> = { concurrency: 10 }
): IQueryExecutor
```

Under the hood it uses [p-queue][13] library to limit concurrency level, so refer to
the library docs for all available `queueOptions`.

#### loadSchema

Executes [GraphQL introspection query][7] using provided [query executor](#query-executor)
and creates an instance of [GraphQL Schema][15] using [`buildClientSchema`][16] utility from
`graphql-js` package.

```ts
async function loadSchema(execute: IQueryExecutor): Promise<GraphQLSchema>
```

#### buildNodeDefinitions

Simple utility that merges user-defined node type configs ([step 2](#2-configure-gatsby-node-types))
with compiled queries ([step 4](#4-compile-sourcing-queries)) for every node type and produces
a value suitable for `gatsbyNodeDefs` option of the [sourcing config](#configuration).

```ts
type RemoteTypeName = string

interface IBuildNodeDefinitionArgs {
  gatsbyNodeTypes: IGatsbyNodeConfig[]
  documents: Map<RemoteTypeName, DocumentNode>
}

export function buildNodeDefinitions(
  args: IBuildNodeDefinitionArgs
): Map<RemoteTypeName, IGatsbyNodeDefinition>
```

### Query compilation tools

#### generateDefaultFragments

Utility function that generates default fragments for every gatsby node type (defined in [step 2](#2-configure-gatsby-node-types)).

```ts
interface IDefaultFragmentsConfig {
  schema: GraphQLSchema
  gatsbyNodeTypes: IGatsbyNodeConfig[]
  gatsbyFieldAliases?: IGatsbyFieldAliases
  defaultArgumentValues?: IArgumentValueResolver[]
}

export interface IArgumentValueResolver {
  (field: GraphQLField<any, any>, parentType: GraphQLObjectType): void | {
    [argName: string]: unknown
  }
}

function generateDefaultFragments(
  config: IDefaultFragmentsConfig
): Map<RemoteTypeName, string>
```

**How does it work?**

Let's look at this example schema:

```graphql
type Post {
  id: ID!
  description(truncateAt: Int!): String
  author: Author
}

type Author {
  id: ID!
  name: Name
}

type Name {
  firstName: String
  lastName: String
}
```

Let's define `gatsbyNodeTypes` option as:

```js
const gatsbyNodeTypes = [
  { remoteTypeName: `Post`, remoteIdFields: [`id`] },
  { remoteTypeName: `Author`, remoteIdFields: [`id`] },
]
```

Then the call `generateDefaultFragments({ schema, gatsbyNodeTypes })` will produce the following fragments:

For `Post` type:

```graphql
fragment Post on Post {
  id
  author {
    remoteId: id
  }
}
```

For `Author` type:

```graphql
fragment Author on Author {
  id
  name {
    firstName
    lastName
  }
}
```

Things to notice:

1. Field `Post.description` is not added. That's because it has a non-null argument
   and we don't know how to fulfill it. If this argument was optional, the field
   would have been added. It is possible to workaround this by using `defaultArgumentValues`
   config option.

2. Selection of the field `Post.author` contains fields listed in `remoteIdFields`
   for type `Author` (applies for any type from the `gatsbyNodeTypes` list).
   It is prefixed with `remoteId` because `id` is an internal Gatsby field.
   So [gatsby field aliases](#gatsby-field-aliases) are used to avoid conflicts during
   sourcing.

3. Field `Author.name` of type `Name` was inlined in the fragment because it is not listed
   in the `gatsbyNodeTypes` list, so considered a non-node object.

Let's define `defaultArgumentValues` to add `Post.description` field to our fragment:

```js
function providePostDescriptionArguments(field, parentType) {
  if (field.name === `description` && parentType.name === `Post`) {
    return { truncateAt: 1000 }
  }
}

generateDefaultFragments({
  schema,
  gatsbyNodeTypes,
  defaultArgumentValues: [providePostDescriptionArguments],
})
```

Now we get this result for the `Post` type:

```graphql
fragment Post on Post {
  id
  description(truncateAt: 1000)
  author {
    remoteId: id
  }
}
```

#### readOrGenerateDefaultFragments

Tries to load fragments from the given `fragmentsDir` and if fragment for some type
could not be found, generates default fragment for it using [`generateDefaultFragments`](#generatedefaultfragments)
and writes it to `fragmentsDir`.

```ts
async function readOrGenerateDefaultFragments(
  fragmentsDir: string,
  config: IDefaultFragmentsConfig
): Promise<Map<RemoteTypeName, GraphQLSource>>
```

See [`generateDefaultFragments`](#generatedefaultfragments) for `IDefaultFragmentsConfig`

Tries to read fragments

#### compileNodeQueries

Combines `queries` from node types config ([step 2](#2-configure-gatsby-node-types))
with any user-defined fragments and produces final queries used for node sourcing.

```ts
interface ICompileNodeDocumentsArgs {
  schema: GraphQLSchema
  gatsbyNodeTypes: IGatsbyNodeConfig[]
  gatsbyFieldAliases?: IGatsbyFieldAliases
  customFragments:
    | Array<GraphQLSource | string>
    | Map<RemoteTypeName, GraphQLSource | string>
}

function compileNodeQueries(
  args: ICompileNodeDocumentsArgs
): Map<RemoteTypeName, DocumentNode>
```

### Schema customization tools

#### createSchemaCustomization

Uses [sourcing config](#configuration) to define Gatsby types (using [schema customization API][8]).
See [step 5](#5-add-explicit-types-to-gatsby-schema) for example.

```ts
async function createSchemaCustomization(config: ISourcingConfig): Promise<void>
```

### Source nodes tools

#### sourceAllNodes

Uses [sourcing config](#configuration) to fetch all data from the remote GraphQL API
and create gatsby nodes (using [createNode action][11]). See [step 6](#6-source-nodes) for example.

```ts
async function sourceAllNodes(config: ISourcingConfig): Promise<void>
```

#### sourceNodeChanges

Uses [sourcing config](#configuration) and a list of node change events (delta) to
delete nodes that no longer exist in the remote API and re-fetch individual nodes
that were updated in the remote API since the last Gatsby build.

See dedicated section [sourcing changes](#sourcing-changes-delta) for details.

```ts
async function sourceNodeChanges(
  config: ISourcingConfig,
  delta: ISourceChanges
): Promise<void>
```

Related types:

```ts
interface IRemoteId {
  [remoteIdField: string]: unknown
}

interface INodeUpdateEvent {
  eventName: "UPDATE"
  remoteTypeName: RemoteTypeName
  remoteId: IRemoteId
}

interface INodeDeleteEvent {
  eventName: "DELETE"
  remoteTypeName: RemoteTypeName
  remoteId: IRemoteId
}

type NodeEvent = INodeUpdateEvent | INodeDeleteEvent

interface ISourceChanges {
  nodeEvents: NodeEvent[]
}
```

## TODO:

- [ ] Allow complex nested `remoteIdFields`
- [ ] Mime-type mapping on nodes
- [ ] Ignore deleted nodes when resolving references
- [ ] Allow custom arguments in schema customization?
- [ ] Docs: "sourcing node field with pagination"
- [ ] Docs: add other lower-level tools in reference
- [ ] Tool: `fetchMissingReferences` fetch missing nodes for existing references
- [ ] Tool: compile Gatsby fragments from remote GraphQL API fragments
- [ ] Tool: auto-configuration for Relay-compliant GraphQL schemas

[1]: https://www.gatsbyjs.org/tutorial/source-plugin-tutorial/
[2]: https://www.gatsbyjs.org/packages/gatsby-source-graphql/
[3]: https://www.gatsbyjs.org/docs/creating-a-source-plugin/#sourcing-data-and-creating-nodes
[4]: https://github.com/gatsbyjs/gatsby/issues/15906
[5]: https://www.gatsbyjs.com/preview/
[6]: https://www.gatsbyjs.com/docs/incremental-builds/
[7]: https://graphql.org/learn/introspection/
[8]: https://www.gatsbyjs.org/docs/schema-customization/
[9]: https://graphql.org/learn/pagination/
[10]: https://graphql.org/learn/queries/#meta-fields
[11]: https://www.gatsbyjs.org/docs/actions/#createNode
[12]: https://relay.dev/graphql/connections.htm
[13]: https://github.com/sindresorhus/p-queue
[14]: https://github.com/node-fetch/node-fetch
[15]: https://graphql.org/graphql-js/type/#graphqlschema
[16]: https://graphql.org/graphql-js/utilities/#buildclientschema
