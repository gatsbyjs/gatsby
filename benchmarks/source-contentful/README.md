# Contentful Benchmark

This benchmark requires a Contentful space and will source its data from there while running the benchmark.

Queries the title, body and a cover image from Contentful. Creates pages for that and displays those three things as "Articles".
Those individual article pages and the homepage share a common "Layout" component (in src/components) that can be swapped (layout_1.js and layout_2.js) to simulate a code change in multiple pages.

## Setup Contentful benchmark site

1. TODO <Setup data source>
2. Copy `.env.example` to `.env.development` and make sure all variables are set
3. Run `yarn setup`

Note that the script is idempotent, so you can re-run it on failures.

Also use `yarn setup --skip [N:number]` to skip first `N` articles
(for example articles created during a previous run)

## Build a site

1. Copy `.env.example` to `.env.production` and make sure all variables are set
2. Run `yarn build`
