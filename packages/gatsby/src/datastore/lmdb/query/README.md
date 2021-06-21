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
- [Selecting an index for query](#selecting-an-index-for-query)
- [Querying](#querying)
  - [Index scans](#scans)
  - [Completing results](#)

## Index structure

Conceptually an index is a huge flat map where keys are _sorted_ tuples of node attributes and values
contain unique id of the indexed objects.

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
["A/a:1/b:1", "foo", "bar", "a1"]: "a1"
["A/a:1/b:1", "foo", "baz", "a1"]: "a1"
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
be returned for a query like this: `{ filter: { a: { in: [null, "foo"] } }, sort: ["b"] }`.

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

# Selecting an index for query

> Unlike databases that have to pick from existing indexes created by users,
> we actually decide which index to _create_ (and then use) for a given query.

Not all filters can use indexes. The following Gatsby filters **can** be used to scan the index:

```
eq, in, gt, gte, lt, lte
```

Those filters **can not**:

```
ne, nin, regex, glob
```

Furthermore, only _some_ combinations of `filters` + `sort` can use index together.
Let's say we have an index `{ a: 1, b: 1 }`.

Only the following queries can be fully resolved using this index:

1. Queries using `eq` filter:

```
{ filter: { a: { eq: "foo" } }, sort: { fields: ["a"] } }
{ filter: { a: { eq: "foo" } }, sort: { fields: ["a", "b"] } }
{ filter: { a: { eq: "foo" } }, sort: { fields: ["b"] } }
{ filter: { a: { eq: "foo" }, b: { eq: "bar" } }, sort: { fields: ["a"] } }
{ filter: { a: { eq: "foo" }, b: { eq: "bar" } }, sort: { fields: ["a", "b"] } }
```

2. Queries using `in`, `gt`, `gte`, `lt`, `lte` filters:

```js
{ filter: { a: { gt: "foo" } }, sort: { fields: ["a"] } }
{ filter: { a: { gt: "foo" } }, sort: { fields: ["a", "b"] } }
```

Generally speaking, there are many variations for a query:

1. Can be fully satisfied by index (i.e., all `filter` and `sort` fields can use the same index)
2. Can be partially satisfied by index (i.e. some `filter` fields and some `sort` fields)
3. Can use index for `filter` statements only
   3.1. Can filter by _all_ fields in query
   3.2. Can filter by _some_ fields but not others
4. Can use index for `sort` statements only
   4.1. Can sort by all fields
   4.2. Can sort by _some_ fields but not others

Other limitations also apply:

- Some combination of fields will produce MultiKey index (which requires deduplication),
  while other - plain single key index;

- Some filter may filter nothing (and return full dataset),
  while other may filter out almost everything and make in-memory sorting efficient.

Ideally, we need statistics about node values to make the best choice (TBD).

But for now we just rely on several assumptions

the following
**simple and dumb™** algorithm is used:

1. All `eq` filters are the most specific

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

> Yet we should seriously consider using for multi-pass
> index scans when [this feature](https://github.com/DoctorEvidence/lmdb-store/issues/64)
> is implemented.
