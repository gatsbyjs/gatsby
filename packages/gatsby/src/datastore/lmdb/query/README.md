# Secondary indexes with LMDB

> **Note:** this doc only covers secondary index implementation when using LMDB as a data store.
> Gatsby in-memory store uses slightly different approach using native JS structures.

Gatsby uses composite indexes to execute queries efficiently ([Compound][1] and [MultiKey][2] indexes in MongoDB terms).
The implementation and limitations are pretty similar to that of MongoDB.

Indexes for all object types are stored in the same LMDB database (aka collection).
Keys in this database are represented as arrays of scalar JS values ([via][4]).

Table of contents:

- [Index structure](#index-structure)
- [Creating an index](#creating-an-index)
  - [Caveat: materialization](#caveat-materialization)
  - [Caveat: concurrent `createIndex` calls](#caveat-concurrent-createindex-calls)
- [Queries that can use index](#queries-that-can-use-index)
- [Suggest index for a query](#suggest-index-for-a-query)
- [Querying](#querying)
  - [Index scans](#scans)
  - [Completing results](#)

# Index structure

Conceptually an index is a huge flat map where keys are _sorted_ tuples of node attributes and values
contain unique id of the indexed objects (and maybe some additional attributes).

For example, imagine a node like this:

```js
const a1 = {
  id: "a1",
  a: "foo",
  b: ["bar", "baz"],
  internal: { type: "A" },
}
```

A secondary index for fields `{ a: 1, b: 1 }` will include **2** entries for this node
(sorted by key):

```
["A/a:1/b:1", "foo", "bar", "a1"]: ["a1"]
["A/a:1/b:1", "foo", "baz", "a1"]: ["a1"]
```

The **first** column is index id: `"A/a:1/b:1`
(the actual implementation uses numeric index id for more compact keys)

The **second** column `"foo"` corresponds to the value of the indexed field `A.a`.

The **third** column (`"bar"` and `"baz"` for the 1st and 2nd rows respectively) corresponds to the field `A.b`.
But since it is an array we add a separate entry for each element with the same prefix.

In other words, index includes a **cartesian product** of all indexed node attributes.

> This is the same concept as [MultiKey][2] index in MongoDB (with similar limitations).

The **last** column in the index key is node id `"a1"`. This column helps to differentiate entries
of different nodes. For instance if we add another node `a2` with the same set of attributes
`a: "foo", b: "bar"` but different `id: "a2"` - our index will have 3 entries:

```
["A/a:1/b:1", "foo", "bar", "a1"]: "a1"
["A/a:1/b:1", "foo", "bar", "a2"]: "a2"
["A/a:1/b:1", "foo", "baz", "a1"]: "a1"
```

> Alternatively we could have used `dupSort` feature of [lmdb-store][3].
> But it doesn't fully solve the problem of duplicates for composite multikey indexes
> ([see details](#todoc)).

### Caveat: `null` and `undefined` values

Imagine we want to add another node `"a3"` to the index which has no `b` field:

```js
const a3 = {
  id: "a3",
  a: null,
  internal: { type: "A" },
}
```

We cannot exclude it from the index because it still has value for `a` field and should
be returned for a query like this: `{ filter: { a: { in: [null, "foo"] } } }`.

So it has to be added to index too. [lmdb-store][3] supports `null` values in keys but not `undefined`.
Thankfully it also supports symbols! So we have a `Symbol("undef")` to represent `undefined`:

```
["A/a:1/b:1", null, Symbol("undef"), "a3"]: "a3"
["A/a:1/b:1", "foo", "bar", "a1"]: "a1"
["A/a:1/b:1", "foo", "bar", "a2"]: "a2"
["A/a:1/b:1", "foo", "baz", "a1"]: "a1"
```

We add a node to index even if the very first attribute `a` is `undefined` because
index may be also used just for sorting: `{ sort: { fields: ["a"] } }`.

> Our indexes are essentially similar to [non-sparse][7] MongoDB indexes

### Caveat: sort order for `null` and `undefined`

TODO

### Caveat: empty arrays

TODO

# Creating an index

`createIndex` expects node type name and index config as input (similar to MongoDB format):

```js
await createIndex(nodeTypeName, { foo: 1, "nested.bar": 1 })
```

Each key in this config is a field to be indexed. Supports dot-notation to express indexes on nested fields.

> Note: in MongoDB config values express sort order of the field in index, but we do not support
> mixed sort order with indexing yet, so this field is redundant (for now).

To actually build an index we traverse all nodes for a given type and get values for all fields
defined in the index config as described in [index structure](#index-structure) chapter.

While creating an index we collect various information:

- Is it a `MultiKey` index (i.e. are there any indexed array values)

This is later used for various optimizations when actually scanning the index.

## Caveat: materialization

There is a special case when we index fields having custom GraphQL resolvers.
Values for such fields require additional resolution step. We call it "materialization".

For example, imaging this node:

```js
const a1 = {
  id: "a1",
  a: "foo",
  b: ["bar", "baz"],
  internal: { type: "A" },
}
```

Also, imagine a custom resolver defined for field `b`:

```js
exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    A: {
      b: source => source.join(`-`),
    },
  })
}
```

Then the actual value added to index will be

```
"bar-baz"
```

> Notes:
>
> 1. Currently, materialization does another full pass on all nodes before `createIndex`.
> 2. Materialization is optional - it doesn't occur if field has no custom resolver.
> 3. The assumption about materialization is that it is deterministic.
>    We do not invalidate materialization results in index unless a corresponding node itself was updated or deleted.

## Caveat: concurrent `createIndex` calls

Technically it is possible to start multiple concurrent attempts to create an index
(or even parallel - from multiple processes).

To mitigate conflicts each index has metadata that includes `state` which helps to implement locking:

```ts
type IndexState = `initial` | `building` | `error` | `ready` | `stale`
```

This metadata is stored in a separate LMDB `metadata` database that can be accessed from multiple processes.

> Note: since multiple processes can write to the same `metadata` database,
> this database uses [versioning][4] feature of `lmdb-store`

## Caveat: indexing errors

LMDB supports key sizes up to 1978 bytes long. If all indexed values combined exceed this limit, then
it will throw. In this case indexing will fail and index will get `error` state.

Query can still run but will have to fallback to full scan.

# Queries that can use index

Not all filters can use indexes. The following Gatsby filters **can**:

```
eq, in, gt, gte, lt, lte
```

Those filters **can not**:

```
ne, nin, regex, glob
```

Furthermore, only _some_ combinations of `filters` + `sort` can use index.

Let's say we have an index `{ a: 1, b: 1 }`.

Only the following combinations can be fully resolved using this index:

**1. Queries using `eq` filter:**

```js
{ filter: { a: { eq: "foo" } }, sort: { fields: ["a"] } }
{ filter: { a: { eq: "foo" } }, sort: { fields: ["a", "b"] } }
{ filter: { a: { eq: "foo" } }, sort: { fields: ["b"] } }
```

**Plus** queries with any additional filter on field `b` (i.e., `eq`, `in`, `gt`, `gte`, `lt`, `lte`):

```js
{ filter: { a: { eq: "foo" }, b: { gt: "bar" } }, sort: { fields: ["a"] } }
{ filter: { a: { eq: "foo" }, b: { in: ["bar"] } }, sort: { fields: ["a", "b"] } }
{ filter: { a: { eq: "foo" }, b: { lte: "bar" } }, sort: { fields: ["b"] } }
```

etc

**2. Queries using `in`, `gt`, `gte`, `lt`, `lte` filters, e.g.:**

```js
{ filter: { a: { gt: "foo" } }, sort: { fields: ["a"] } }
{ filter: { a: { gt: "foo" } }, sort: { fields: ["a", "b"] } }
```

**Plus** any other filter on field `b` (`eq, in, gt, gte, lt, lte`).

**That's it.**

Any other combinations **can not** use index for both `filter` and `sort` (only for one of those).

For example, the following queries can only use index `{ a: 1, b: 1 }` for `filter` (but not `sort`):

```
{ filter: { a: { gt: "foo" } }, sort: { fields: ["b"] } }
{ filter: { a: { gt: "foo" }, b: { eq: "bar" } }, sort: { fields: ["b"] } }
```

While those queries can only use index for `sort`:

```
{ filter: { b: { eq: "foo" } }, sort: { fields: ["a"] } }
{ filter: { b: { eq: "foo" } }, sort: { fields: ["a", "b"] } }
{ filter: { b: { gt: "foo" } }, sort: { fields: ["a"] } }
```

etc.

# Suggest index for a query

Unlike databases that must select one of the existing indexes created by users,
we actually decide which index to **create** for a given query (and then use).

For now, the general algorithm is simple:

1. Pick fields that work both for `filter` and `sort`
   (as described in the [section](#queries-that-can-use-index) above)
2. When it's not possible - pick `filter` fields (sorted by comparator specificity) if:
   1. there are filters on multiple fields
   2. there is a single `eq` or `in` filter
   3. there is a filter with two comparators (e.g. `gt` and `lt`)
3. In all other cases - pick `sort` fields for index

TODO: try to avoid fields on array values (so avoid MultiKey indexes when possible).

TODO: Filter and sort fields that can not be used for range scans directly are added to index
_values_. This allows us to avoid additional expensive `getNode` operations.

> In general, selecting the best index to build and use is _exceptionally_ hard.
> Databases use sophisticated heuristics and statistics as a part of this process.
> Our current approach is rather naive and has plenty of room for improvement.

# Running a query

Running a query consists of several steps:

1. Select an index
2. Create this index (if it does not exist yet)
3. Scan the index
   1. Generate ranges for index scan from the query (sorted according to requested sorting)
   2. Fetch ranges and concat them
   3. If index is a `MultiKey` index - additionally deduplicate results
   4. Apply remaining filters (if any) that may use the data stored in the index
   5. If sorting is not satisfied by the index itself but index contains data needed for sorting -
      load the data into memory and run in-memory sort.
4. Complete query results
   1. For each index entry - load full node object
   2. Apply any remaining unapplied filter
   3. If sorting is not satisfied by the index - traverse all resulting nodes and sort in-memory.

Every step uses iterators and generators, so essentially it is a single traversal defined
lazily. It doesn't actually require double traversal (except when in-memory sorting is actually needed).

## Caveat: MultiKey indexes and count

Multikey index cannot reliably count the number of elements returned by some query
The following node has two entries in index `{ a: 1 }`.

```js
const node = { id: 1, a: [`foo`, `bar`] }
```

It may show up multiple times in results for range queries (like `in` or `gt`).

The only case when it returns reliable count is when _all_ multikey fields are filtered with `eq`
predicate (field `a` in this example).

So in the worst case we must traverse all index results and deduplicate to get the actual count.

## Caveat: MultiKey index and limit, offset

Limit and offset are also unreliable with MultiKey indexes
(also unless all multiKey fields have `eq` predicate).

## Caveat: counts

## Caveat: mixed sort order

Currently, we cannot scan index in mixed order. This feature requires binary inversion for key elements
in `lmdb-store` which is [not yet available][6].

# Limitations

> One major problem with MultiKey indexes is duplication of node ids in results in range queries
> which requires additional deduplication pass and complicates counting the total number of results.

# Caveats

- key size limit
- mixed sort order
- materialization
- using node counter for default sorting vs ndoe id
- tracking inline objects
- counts and any aggregations...!

Fast counts are only possible for plain indexes (non-MuliKey) +
when all filter fields are included in index.

So for fast counts FILTER fields are more important than SORT fields.

and ensures consistent ordering when query has no sort order set.

> In databases the last column is usually the same as primary key (in our example "a1").
> But Gatsby uses UUID for the actual id value which is 16 bytes uncompressed.

# Gatsby-specific

# Problems and potential improvements

- pagination
- aggregation (count, min, max, etc)

[1]: https://docs.mongodb.com/manual/core/index-compound/
[2]: https://docs.mongodb.com/manual/core/index-multikey/
[3]: https://github.com/DoctorEvidence/lmdb-store
[4]: https://github.com/DoctorEvidence/lmdb-store#keys
[5]: https://github.com/DoctorEvidence/lmdb-store#concurrency-and-versioning
[6]: https://github.com/DoctorEvidence/lmdb-store/discussions/62#discussioncomment-898949
[7]: https://docs.mongodb.com/manual/core/index-sparse/

> Yet we should seriously consider using for multi-pass
> index scans when [this feature](https://github.com/DoctorEvidence/lmdb-store/issues/64)
> is implemented.
