TODO:

- Input/Filter: id/parent/children fields!
- ITC on InterfaceTypeComposer

- Internal field on Node interface needs: contentDigest, content, etc.
- dropTypeModifiers helper!
- What should be TypeComposer, what simple GraphQL types?
- FUTURE: Build our own schemaComposer (manages a simple Map; uses graphql-js's ability to parse string types)
- FUTURE: Check for directives directly on the AST instead of using SchemaDirectiveVisitor
- Try not to mutate queryArgs, and importantly don't mutate the nodes (in getNodesForQuery)
  as that would be persisted in redux which leads to all kinds of problems
- Consistently use isObject()
- Should the getById logic be moved to a HOC in resolvers (shared by findById(s) and link)?
- Exclude/ignore certain types and fields. E.g. no need to infer types from every package.json field!
  Also it makes sense for (internal) plugins to specify their typeDefs explicitly
- Are we supposed to get `path` from `context` or from `rootValue`?
- resolve fields not on node (fields from @link or \_\_\_NODE,
  fields from setFieldOnGraphQLNodeType)
- addSchemaMustHaveType: should be Set/Map
- add page dependencies: const pageDependencyResolver = require(`./page-dependency-resolver`)
- tracing
- sift { AND: FilterInput, OR: FilterInput }
- connections, pagination - choose a graphql-compose plugin
- clean up getExampleValue & getFilterInput
- flow annotations
- caches & hot reloading: what to clear when
- what goes in resolvers/, what in db/, what in query/
- make resolvers:withSpecialCases independent of query operators
- type-conflict-reporter
- support Union types
- \_\_NODE
- what exactly is "update schema" in bootstrap for?
- node-tracking vs `__parent` field?
- UPSTREAM: getITC() on IFTC
- Where to initialize node-tracking cache?
- async/await-ify
- is **_SOURCE_** on the parent field used anywhere? I think only gatsby-source-filesystem does this.
  (And `internal-data-bridge` sets "SOURCE" on `parent`)
  It really just should set it to null, since **_SOURCE_** is not a valid id.
- Does Sift handle non-existing fields/objects with `ne` queries correctly? See:
  ```js
  sift({ foo: { bar: { $ne: true } } }, [{ foo: [{}] }])
  // [ { foo: [ {} ] } ]
  sift({ foo: { bar: { $ne: true } } }, [{ foo: [] }])
  // []
  ```
- IMPORTANT: Can we start filtering a query further starting with `source` instead of `getNodesByType`
  (except on root query fields of course). This would also enable passing args to `childImageSharp` and similar fields
  instead of having every arg in the root field.
- Dont't capitalize sort fields (but use triple underscore as separator)
- Allow specifying sort order per sort field

# PACKAGES

## OBSOLETE:

- is-relative
- is-relative-url
- graphql-skip-limit
- type-of
- graphql-relay
- graphql-type-json

## NEW:

- graphql-compose
- micromatch
- some momentjs alternative
