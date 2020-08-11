# MDX Benchmark

This is a baseline benchmark for tracking MDX performance.

The site can generate an arbitrary amount of super simple pages. Each page has a small header, imports a file, and has two small paragraphs of random text. No images, because we want to benchmark MDX.

This uses the local file system plugin, though we might switch to sourcing from csv since that has a more efficient internal representation (fewer `File` nodes).

## Install

Run `yarn` or `npm install`

## Usage

You can start a benchmark run like this:

```shell
CI=1 N=1000 M=2 yarn bench
```

- `CI=1`: this enables the fastest reporter, with simplest output, that we have
- `N=1000`: instructs the run to build a site of 1000 pages
- `M=2`: instructs nodejs to use up to 2gb of memory for its long term storage
- Deletes generates files from previous run
- Generates `N` pages with pseudo-random content
- Runs `gatsby clean`
- Runs `gatsby build`

The default `yarn bench` will build 512 pages with 1gb memory.

There is also `yarn bench:inspect` for debugging with the Chrome devtools.
