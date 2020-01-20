# gatsby-benchmarks

This plugin is used to send env data / meta information / results when running a benchmark.

The plugin is intended to be used for our internal benchmarking infra.

## Usage

Add the plugin to your gatsby-config.js

```js
module.exports = {
  plugins: ["gatsby-plugin-benchmark-reporting"],
}
```

The plugin will either logs results to the terminal, or if `BENCHMARK_REPORTING_URL` is set as an environment variable, it will POST a JSON with the results and meta data to given endpoint (url).

By default it logs to terminal.

## Errors

The plugin

- will try to wait for submitted data to complete
- logs the error message to terminal
- does not report an error to the remote
- triggers `exit 1` to signal to the host that an error happened
