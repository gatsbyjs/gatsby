## Gatsby master

- Gatsby: master

```
query $ NUM_PAGES=10000 bin/runQueryTiming.sh
21.978
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
