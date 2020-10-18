# Contentful Benchmark

This benchmark requires a Contentful space and will source its data from there while running the benchmark.

Queries the title, body and a cover image from Contentful. Creates pages for that and displays those three things as "Articles".
Those individual article pages and the homepage share a common "Layout" component (in src/components) that can be swapped (layout_1.js and layout_2.js) to simulate a code change in multiple pages.

## Setup Contentful benchmark site

1. Setup will-it-build data source
2. Copy `.env.example` to `.env.development` and make sure all variables are set
3. Run `yarn setup`

Note that the script is idempotent, so you can re-run it on failures.

Also use `yarn setup --skip [N:number]` to skip first `N` articles
(for example articles created during a previous run which failed)

### Fixing broken images

Sometimes Contentful silently fails to process images which causes builds to fail.
Use following approach to fix those:

1. Run `yarn site find-broken-images`
2. Change image URLs in will-it-build dataset for this site to some other images
   (or just use one of the larger sites and set `BENCHMARK_SITE_ID` appropriately)
3. Run `yarn site fix-broken-images imageid1 imageid2 imageid3`
   This command updates broken images with images from the `BENCHMARK_SITE_ID` dataset

## Build a site

1. Copy `.env.example` to `.env.production`
2. Set `BENCHMARK_CONTENTFUL_SPACE_ID` and `BENCHMARK_CONTENTFUL_ACCESS_TOKEN` variables
3. Run `yarn build`

## Update data

1. Copy `.env.example` to `.env.production`
2. Set `BENCHMARK_CONTENTFUL_SPACE_ID` and `BENCHMARK_CONTENTFUL_MANAGEMENT_TOKEN`
   variables
3. Run `yarn data-update`
