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
query $ NUM_PAGES=10000 bin/runQueryTiming.sh
16.512
```

## Gatsby loki with index

- Gatsby:loki
- Index = true
- loki nested index patch

```
query $ NUM_PAGES=10000 bin/runQueryTiming.sh
7.713
```
