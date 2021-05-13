# Filters and sort benchmark

Stress tests various query filters (with and without sorting by random value).

# Usage

```shell
NUM_NODES=1000 NUM_PAGES=1000 FILTER=eq SORT=1 TEXT=1 yarn bench
```

Explanation:

- `FILTER`: one of `eq`, `gt`, `gt-lt`, `in`, `lt`, `ne`, `nin`, `regex`, `elemMatch-eq` (default: `eq`).
  See `src/templates` for specific queries.
- `SORT`: when set, the benchmark will also add sorting to the query (by random integer value)
- `TEXT`: all nodes are lightweight by default (just 5 fields with numeric values or short strings).\
  When settings this env variable - each node will get additional field with 4k of text
  (useful for memory usage measurements)
- `NUM_NODES`: the number of nodes created (1000 by default)
- `NUM_PAGES`: the number of pages created (1000 by default, must be >= `NUM_NODES`)

# Example

Let's figure out time complexity of `gt` filter. To make this happen - let's run the benchmark
3 times with the same number of pages but growing number of nodes:

### run 1:

```shell
NUM_NODES=1000 FILTER=gt yarn bench
```

### run 2:

```shell
NUM_NODES=10000 FILTER=gt yarn bench
```

### run 3:

```shell
NUM_NODES=100000 FILTER=gt yarn bench
```
