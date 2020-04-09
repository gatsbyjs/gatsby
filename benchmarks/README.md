# Benchmarks

Example sites for benchmarking `gatsby`.

## Interface

The standard interface for running a benchmark is:

```shell
cd {benchmark directory}
export NUM_PAGES={n}
npm install
npm run build / gatsby build
```

If a specific benchmark needs to perform some code generation (e.g. `markdown_id`),
that generation shall happen in a `postinstall` script.
Any `postinstall` script must ensure that previous benchmark runs do not interfere with the current run.

For example:

```text
"postinstall": "del-cli ./generated && gatsby clean && npm run generate"
```
