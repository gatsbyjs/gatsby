# Secondary indexes with LMDB

> **Note:** this doc only covers secondary index implementation when using LMDB as a data store.
> Gatsby in-memory store uses slightly different approach using native JS structures.

Gatsby uses composite indexes to execute queries efficiently ([Compound][1] and [MultiKey][2] indexes in MonboDB terms).
So the implementation and limitations are pretty similar to that of MongoDB.

Indexes for all node types are stored in the same LMDB database (aka collection).
Keys in this database are represented as arrays of scalar JS values ([via](https://github.com/DoctorEvidence/lmdb-store#keys)).

The first element of each key is index id. Prefixing by index id enables range queries against individual indexes.

Querying using indexes involves 4 major parts:

1. Deciding which fields to index for a given query
2. Creating an index
3. Index scans
4. Completing query results that cannot be satisifed by the index

## Index structure

Conceptually an index is a huge flat map where keys are _sorted_ tuples of node attributes and values
contain node id.

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

> This is important because it leads to a problem: duplication of resolved node
> ids when running range queries or querying by equality using index prefix
> (as well as other [limitations similar to MongoDB](https://docs.mongodb.com/manual/core/index-multikey/#limitations))

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

[lmdb-store][3] supports `null` values in keys but not `undefined`.
Thankfully it also supports symbols! So we have a `Symbol("undef")` to represent `undefined`:

```
["A/a:1/b:1", null, Symbol("undef"), "a3"]: "a3"
["A/a:1/b:1", "foo", "bar", "a1"]: "a1"
["A/a:1/b:1", "foo", "bar", "a2"]: "a2"
["A/a:1/b:1", "foo", "baz", "a1"]: "a1"
```

We add a node to index even if the very first attribute `a` is `undefined` because
index may be used just for sorting: `{ sort: { fields: ["a"] } }`.

### Caveat: sort order for `null` and `undefined`

TODO

### Caveat: empty arrays

TODO

# Creating an index

At the moment we create an index for a query at the very first `runQuery` call.
We retrieve the state of the index by id from `metadata` database and if there is no
such index - build it from scratch.

To build an index we traverse all nodes for a given type

## Caveats: materialization

# Limitations

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

> Yet we should seriously consider using for multi-pass
> index scans when [this feature](https://github.com/DoctorEvidence/lmdb-store/issues/64)
> is implemented.
