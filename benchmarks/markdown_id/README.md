# Markdown Benchmark Index = id

This benchmark first generates a number of randomly generated md pages (configure the number by setting `NUM_PAGES=400`) and then it builds.

The base for this site is `gatsby-starter-blog`.

This particular markdown benchmark will query pages by their `id`, which is (at the time of writing) faster than indexing pages by their `slug`.

The pre-generate script stores pages in root/markdown-pages.

## Usage

```shell
yarn
yarn bench
```

If you want to run the same pages without regenerating them you can use `yarn benchnb`. It's fine to use `gatsby clean` regardless.

### Detailed steps

Use `yarn` to install if you want to use `gatsby-dev`. Otherwise I don't think it matters between `yarn` or `npm install`.

```shell
# Requires node 8+
# nvm use 8
yarn
rm -r markdown-pages
NUM_PAGES=2000 node md.generate.js
gatsby clean
node --max_old_space_size=2000 node_modules/.bin/gatsby build
```

The last step could also just be `gatsby build` if the number of pages is small enough. The example will increase the maximum reserved "old object space" which you'll need for a larger number of pages.
