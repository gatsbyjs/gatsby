## Summary

Key findings:

- loki without indexes is overall slightly faster than master, except when there are many types
- loki with indexes is about 2x faster on sites with 10k pages, and 5x faster with 20k pages. But is ever so slightly slower when those pages are split across 100 types.

Overall, loki is a big win for sites with lots of pages of the same type. For smaller sites, the difference is negligible.

## Benchmarks

Performed on 2018 13" MBP. 4-core 2.7 GHz Intel Core i7. 16 GB 2133 MHz LPDDR3

### Gatsby master

- Gatsby: master

```shell
query $ NUM_TYPES=1 NUM_PAGES=10000 bin/runQueryTiming.sh
21.135
```

```shell
query $ NUM_TYPES=100 NUM_PAGES=10000 bin/runQueryTiming.sh
13.112
```

```shell
query $ NUM_TYPES=1 NUM_PAGES=20000 bin/runQueryTiming.sh
67.812
```

```shell
query $ NUM_TYPES=100 NUM_PAGES=20000 bin/runQueryTiming.sh
24.656
```

### Gatsby loki without index

- Gatsby:loki
- Index = false
- loki nested index patch

```shell
query $ NUM_TYPES=1 NUM_PAGES=10000 bin/runQueryTiming.sh
14.834
```

```shell
query $ NUM_TYPES=100 NUM_PAGES=10000 bin/runQueryTiming.sh
14.676
```

```shell
query $ NUM_TYPES=1 NUM_PAGES=20000 bin/runQueryTiming.sh
58.377
```

```shell
query $ NUM_TYPES=100 NUM_PAGES=20000 bin/runQueryTiming.sh
27.486
```

### Gatsby loki with index

- Gatsby:loki
- Index = true
- loki nested index patch

```shell
query $ NUM_TYPES=1 NUM_PAGES=10000 bin/runQueryTiming.sh
8.126
```

```shell
query $ NUM_TYPES=100 NUM_PAGES=10000 bin/runQueryTiming.sh
15.050
```

```shell
query $ NUM_TYPES=1 NUM_PAGES=20000 bin/runQueryTiming.sh
12.797
```

```shell
query $ NUM_TYPES=100 NUM_PAGES=20000 bin/runQueryTiming.sh
27.020
```
