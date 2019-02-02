# Query running

To test that `loki` db engine matches redux behaviour, we run build for both engines and

- do baseline snapshot testing for query results for redux engine
- compare results of loki engine to results of redux engine

Input nodes are defined in `nodes-data.js`, and test queries are defined in `input` directory.
