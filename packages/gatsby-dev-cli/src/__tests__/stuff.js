const watch = require(`../watch`)
const path = require(`path`)
const _ = require(`lodash`)

const monoRepoPackages = [
  `.DS_Store`,
  `babel-plugin-remove-graphql-queries`,
  `babel-preset-gatsby`,
  `babel-preset-gatsby-package`,
  `cypress-gatsby`,
  `gatsby`,
  `gatsby-cli`,
  `gatsby-codemods`,
  `gatsby-cypress`,
  `gatsby-dev-cli`,
  `gatsby-image`,
  `gatsby-link`,
  `gatsby-plugin-canonical-urls`,
  `gatsby-plugin-catch-links`,
  `gatsby-plugin-coffeescript`,
  `gatsby-plugin-create-client-paths`,
  `gatsby-plugin-cxs`,
  `gatsby-plugin-emotion`,
  `gatsby-plugin-facebook-analytics`,
  `gatsby-plugin-feed`,
  `gatsby-plugin-flow`,
  `gatsby-plugin-fullstory`,
  `gatsby-plugin-glamor`,
  `gatsby-plugin-google-analytics`,
  `gatsby-plugin-google-gtag`,
  `gatsby-plugin-google-tagmanager`,
  `gatsby-plugin-guess-js`,
  `gatsby-plugin-jss`,
  `gatsby-plugin-layout`,
  `gatsby-plugin-less`,
  `gatsby-plugin-lodash`,
  `gatsby-plugin-manifest`,
  `gatsby-plugin-netlify`,
  `gatsby-plugin-netlify-cms`,
  `gatsby-plugin-no-sourcemaps`,
  `gatsby-plugin-nprogress`,
  `gatsby-plugin-offline`,
  `gatsby-plugin-page-creator`,
  `gatsby-plugin-postcss`,
  `gatsby-plugin-preact`,
  `gatsby-plugin-react-css-modules`,
  `gatsby-plugin-react-helmet`,
  `gatsby-plugin-remove-trailing-slashes`,
  `gatsby-plugin-sass`,
  `gatsby-plugin-sharp`,
  `gatsby-plugin-sitemap`,
  `gatsby-plugin-styled-components`,
  `gatsby-plugin-styled-jsx`,
  `gatsby-plugin-styletron`,
  `gatsby-plugin-stylus`,
  `gatsby-plugin-subfont`,
  `gatsby-plugin-twitter`,
  `gatsby-plugin-typescript`,
  `gatsby-plugin-typography`,
  `gatsby-react-router-scroll`,
  `gatsby-remark-autolink-headers`,
  `gatsby-remark-code-repls`,
  `gatsby-remark-copy-linked-files`,
  `gatsby-remark-custom-blocks`,
  `gatsby-remark-embed-snippet`,
  `gatsby-remark-graphviz`,
  `gatsby-remark-images`,
  `gatsby-remark-images-contentful`,
  `gatsby-remark-katex`,
  `gatsby-remark-prismjs`,
  `gatsby-remark-responsive-iframe`,
  `gatsby-remark-smartypants`,
  `gatsby-source-contentful`,
  `gatsby-source-drupal`,
  `gatsby-source-faker`,
  `gatsby-source-filesystem`,
  `gatsby-source-graphql`,
  `gatsby-source-hacker-news`,
  `gatsby-source-lever`,
  `gatsby-source-medium`,
  `gatsby-source-mongodb`,
  `gatsby-source-npm-package-search`,
  `gatsby-source-shopify`,
  `gatsby-source-wikipedia`,
  `gatsby-source-wordpress`,
  `gatsby-telemetry`,
  `gatsby-transformer-asciidoc`,
  `gatsby-transformer-csv`,
  `gatsby-transformer-documentationjs`,
  `gatsby-transformer-excel`,
  `gatsby-transformer-hjson`,
  `gatsby-transformer-javascript-frontmatter`,
  `gatsby-transformer-javascript-static-exports`,
  `gatsby-transformer-json`,
  `gatsby-transformer-pdf`,
  `gatsby-transformer-react-docgen`,
  `gatsby-transformer-remark`,
  `gatsby-transformer-screenshot`,
  `gatsby-transformer-sharp`,
  `gatsby-transformer-sqip`,
  `gatsby-transformer-toml`,
  `gatsby-transformer-xml`,
  `gatsby-transformer-yaml`,
  `graphql-skip-limit`,
]
const root = path.join(__dirname, `..`, `..`, `..`, `..`)

console.log(root)

it(`watching gatsby-cli installs gatsby`, () => {
  const result = watch(root, [`gatsby-cli`], {
    scanOnce: true,
    quiet: true,
    monoRepoPackages,
    localPackages: [`gatsby`, `gatsby-plugin-sharp`],
  })

  const pickedResult = _.omit(result, [`monoRepoPackages`])

  expect(pickedResult).toMatchInlineSnapshot(`Object {}`)

  expect(result.packagesToInstall).toEqual(expect.arrayContaining([`gatsby`]))
  expect(result.packagesToInstall).not.toContain(`gatsby-cli`)
  expect(result.packagesToInstall).not.toContain(`gatsby-plugin-sharp`)
})

it(`watching gatsby-source-filesytem and having gatsby-source-wordpress installs gatsby-source-wordpress`, () => {
  const result = watch(root, [`gatsby-source-filesystem`], {
    scanOnce: true,
    quiet: true,
    monoRepoPackages,
    localPackages: [`gatsby`, `gatsby-source-wordpress`],
  })

  const pickedResult = _.omit(result, [`monoRepoPackages`])

  expect(pickedResult).toMatchInlineSnapshot(`Object {}`)

  expect(result.packagesToInstall).toEqual(
    expect.arrayContaining([`gatsby-source-wordpress`])
  )
  expect(result.packagesToInstall).not.toContain(`gatsby-source-filesystem`)
  expect(result.packagesToInstall).not.toContain(`gatsby-plugin-sharp`)
})

it(`watching gatsby-source-filesytem and having gatsby-source-filesystem installs gatsby-source-filesystem`, () => {
  const result = watch(root, [`gatsby-source-filesystem`], {
    scanOnce: true,
    quiet: true,
    monoRepoPackages,
    localPackages: [`gatsby`, `gatsby-source-filesystem`],
  })

  const pickedResult = _.omit(result, [`monoRepoPackages`])

  expect(pickedResult).toMatchInlineSnapshot(`Object {}`)

  expect(result.packagesToInstall).toEqual(
    expect.arrayContaining([`gatsby-source-filesystem`])
  )
  expect(result.packagesToInstall).not.toContain(`gatsby-source-wordpress`)
})

it(`watching gatsby-source-filesytem and not having gatsby-source-filesystem or gatsby-source-wordpress, installs nothing - probably should throw`, () => {
  const result = watch(root, [`gatsby-source-filesystem`], {
    scanOnce: true,
    quiet: true,
    monoRepoPackages,
    localPackages: [`gatsby`],
  })

  const pickedResult = _.omit(result, [`monoRepoPackages`])

  expect(pickedResult).toMatchInlineSnapshot(`Object {}`)

  expect(result.packagesToInstall).toEqual(expect.arrayContaining([]))
  expect(result.packagesToInstall).not.toContain(`gatsby-source-wordpress`)
  expect(result.packagesToInstall).not.toContain(`gatsby-source-filesystem`)
})

it(`watching gatsby-source-filesytem and both having gatsby-source-filesystem and gatsby-source-wordpress, should install both`, () => {
  const result = watch(root, [`gatsby-source-filesystem`], {
    scanOnce: true,
    quiet: true,
    monoRepoPackages,
    localPackages: [
      `gatsby`,
      `gatsby-source-filesystem`,
      `gatsby-source-wordpress`,
    ],
  })

  const pickedResult = _.omit(result, [`monoRepoPackages`])

  expect(pickedResult).toMatchInlineSnapshot(`Object {}`)

  expect(result.packagesToInstall).toEqual(
    expect.arrayContaining([
      `gatsby-source-filesystem`,
      `gatsby-source-wordpress`,
    ])
  )
})
