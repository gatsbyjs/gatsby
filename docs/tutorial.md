# Tutorial

## Building a documentation site from the Gatsby Documentation Starter

1. Install gatsby `npm install -g gatsby`
1. Install documentation site starter `gatsby new docs-site
   gh:gatsbyjs/gatsby-starter-documentation`
2. type `cd docs-site`
2. type `gatsby develop`
3. Open site in browser at [localhost:8000](http://localhost:8000). Verify clicking on links works.
4. Try editing the site's config file `config.toml`.
   Change the `siteTitle` key. The site's title should change shortly
   after saving.
5. Next try editing a doc page. Open
   `/pages/docs/getting-started/index.md` and edit it. Again any saved
   changes should load without refreshing in the browser.
6. Add a new markdown page to the documentation. Copy the `getting-started`
   directory to `some-additional-steps`. Then edit the markdown file
   within the new directory. If you're familiar with other static site
   generation software, you'll be familiar with the "frontmatter" at the
   top of the file. Edit the title there + change the order to "5". Save
   this. Ideally this new file would be hot reloaded like other changes
   but I haven't figured out how to make this happen yet ([help
   appreciated here](https://github.com/webpack/webpack/issues/1162)).
   So to see your new page, restart `gatsby develop` and then refresh your
   browser.
7. Build your site `gatsby build`. The site is built to the `/public`
   directory. Test that the build worked by running `gatsby serve-build`
   which serves the contents of the `/public` directory.
