# Query benchmark

Stress tests creating lots of queries.

Defaults to building a site with 5k pages split evenly amongst 10 types. Set the `NUM_PAGES` environment variable to change the number of pages, and `NUM_TYPES` to change the number of types they're split over. E.g to create a site with 5 types, each with 200 pages, do `NUM_TYPES=5 NUM_PAGES=1000 gatsby build`

By default it uses simple queries which creates very few data dependencies for each page. If you want to stress test data dependencies tracking use truthy `QUERY_LINKED_NODES` environment variable. E.g. `QUERY_LINKED_NODES=1 gatsby build`
