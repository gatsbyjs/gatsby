# babel-plugn-remove-graphql-queries

This [Babel](https://babeljs.io/) plugin is used when a component that you would like to render in [Storybook](https://storybook.js.org) uses `useStaticQuery` hook or `StaticQuery` component.
For more information on setting up storybook refer to the [Docs](https://www.gatsbyjs.com/docs/how-to/testing/visual-testing-with-storybook/)

## Usage

For most users this will work out of the box by following the storybook setup. There are some use cases where you might need to adjust the options to get it working as intended.

#### When you need to build Storybook irrespective of Gatsby

There may be a use-case where you need to build your Storybook, and it doesn't make sense to run a Gatsby build, eg using chromatic, building Storybook in CI.
The way this plugin works is to look inside the `public` folder to resolve the `graphql` queries. On CI, or inside `github` the `public` folder is ignored, and hence does not exist. This will cause the Storybook build to fail. To resolve this, you can use the plugin options to tell this plugin where to look for the `StaticQuery` json files.

## Options

Options are defined when you register the plugin in your storybooks `webpack.config.js` - the below example assumes you have followed the Gatsby-Storybook setup guide.

```js
// .storybook/webpack.confiig.js
{
   plugins: [
        [
          require.resolve("babel-plugin-remove-graphql-queries"),
          {
            rootDir: ".storybook", // the root folder where your static queries are, defaults to public
            staticQueryDir: "staticQueries", // the subdirectory where the static queries are
          },
        ],
      ],
}
```

### `rootDir`

`string`, defaults to `public`.

### `staticQueryDir`

`string`, defaults to `static/d`.

You will need to put these static queries files in the folder you specifiy. The script below will do it automatically (and you could add this to a post build or `npm script`), or you can manually do it when needed.

```shell
cp -r ./public/page-data/sq/d ./.storybook/staticQueries
```

#### Gotcha

- This [PR](https://github.com/gatsbyjs/gatsby/pull/26242/files) changes the location of the static queries directory. You may need to define in your storybook options depending on if you are using a version of Gatsby later than `gatsby@2.24.33`
