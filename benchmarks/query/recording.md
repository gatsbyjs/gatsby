## Gatsby master

- Gatsby: master

```
query $ NUM_TYPES=1 NUM_PAGES=10000 bin/runQueryTiming.sh
21.135
```

```
query $ NUM_TYPES=100 NUM_PAGES=10000 bin/runQueryTiming.sh
13.112
```

```
query $ NUM_TYPES=1 NUM_PAGES=20000 bin/runQueryTiming.sh
67.812
```

```
query $ NUM_TYPES=100 NUM_PAGES=20000 bin/runQueryTiming.sh
24.656
```

## Gatsby loki without index

- Gatsby:loki
- Index = false
- loki nested index patch

```
query $ NUM_TYPES=1 NUM_PAGES=10000 bin/runQueryTiming.sh
14.834
```

```
query $ NUM_TYPES=100 NUM_PAGES=10000 bin/runQueryTiming.sh
14.676
```

```
query $ NUM_TYPES=1 NUM_PAGES=20000 bin/runQueryTiming.sh
58.377
```

```
query $ NUM_TYPES=100 NUM_PAGES=20000 bin/runQueryTiming.sh
27.486
```

## Gatsby loki with index

- Gatsby:loki
- Index = true
- loki nested index patch

```
query $ NUM_TYPES=1 NUM_PAGES=10000 bin/runQueryTiming.sh
8.126
```

```
query $ NUM_TYPES=100 NUM_PAGES=10000 bin/runQueryTiming.sh
15.050
```

```
query $ NUM_TYPES=1 NUM_PAGES=20000 bin/runQueryTiming.sh
12.797
```

```
query $ NUM_TYPES=100 NUM_PAGES=20000 bin/runQueryTiming.sh
27.020
```
