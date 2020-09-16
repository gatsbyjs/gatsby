# Markdown Benchmark; CSV version

This is a baseline benchmark for tracking Markdown performance in the Gabe project.

This should be the same benchmark as `gabe-markdown` except it uses the `gatsby-source-csv` rather than `gatsby-source-filesystem`. This benchmark attempts to explicitly differentiate between them.

The site can generate an arbitrary amount of super simple pages. Each page has a small header, a quote, and two small paragraphs of random text. No images, because we want to benchmark Markdown.

## Install

Run `yarn` or `npm install`

## Usage

You can start a benchmark run like this:

```shell
N=1000 M=2 yarn bench
```

- `N=1000`: instructs the run to build a site of 1000 pages
- `M=2`: instructs nodejs to use up to 2gb of memory for its long term storage
- Deletes generates files from previous run
- Generates `N` pages with pseudo-random content
- Runs `gatsby clean`
- Runs `gatsby build`

The default `yarn bench` will build 512 pages with 1gb memory.
