---
title: "Getting Started with Gatsby Themes and MDX"
date: 2019-02-26
author: Katie Fujihara
tags: ["themes", "getting-started"]
---

> _Updated July 9, 2019 to reflect using the `gatsby-plugin-mdx` package instead of the (now deprecated) gatsby-mdx package._

### What is a Gatsby theme?

<Pullquote cite="Jason Lengstorf">
  Gatsby themes allow you to focus only on the parts of the site and app
  building process that you need to care about by abstracting the rest away into
  a package.
</Pullquote>

## Getting Started

Create a new directory

`mkdir gatsby-themes`

Navigate to the directory

`cd gatsby-themes`

Create a _package.json_ file

`yarn init -y`

Tidy up your _package.json_ file and create workspaces which includes the project name, site, and your packages. Both of these directories will include their own _package.json_ files.

```json:title=package.json
{
  "name": "gatsby-site",
  "private": true,
  "version": "1.0.0",
  "workspaces": ["site", "packages/*"]
}
```

Next, you want to create your _site_ directory and your _packages_ directory within your _gatsby-theme_ project directory. Make sure the names that you choose for your directories are the same as what you put in your workspaces. You will also want to go into your packages directory and make another directory with the name of your theme. For the purpose of this tutorial, we will call it _theme_. Then you will want to `yarn init` the _theme_ directory and the _site_ directory.

```shell
mkdir site
mkdir packages
cd packages
mkdir theme
cd theme
yarn init -y
touch index.js
cd ../../site/
yarn init -y
```

The `-y` in `yarn init` automatically adds defaults to your `package.json`. If you opt to run `yarn init` without `-y` you will be asked a few questions. The main thing you will want to pay attention to is the entry point (index.js). For the _theme_ directory, you can leave the entry point as _index.js_ (just make sure you have an _index.js_ file).

```json:title=packages/theme/package.json
{
  "name": "theme",
  "version": "1.0.0",
  "description": "Practicing making a Gatsby theme",
  "main": "index.js",
  "license": "MIT"
}
```

You will want to add Gatsby, React, and ReactDOM to as dev dependencies for _site_.

`yarn workspace site add gatsby react react-dom`

Then you will navigate out of the _site_ directory and add Gatsby, React, and ReactDOM as dev dependencies for _theme_.

`yarn workspace theme add gatsby react react-dom -D`

You will want to make Gatsby, React, and ReactDom peer dependencies in the _theme_ directory.

```json:title=packages/theme/package.json
 "devDependencies": {
    "gatsby": "^2.0.118",
    "react": "^16.8.1",
    "react-dom": "^16.8.1"
  },
  "peerDependencies": {
    "gatsby": "^2.0.118",
    "react": "^16.8.1",
    "react-dom": "^16.8.1"
  },
```

## Installing MDX and gatsby-plugin-page-creator

### What is MDX?

> MDX is markdown for the component era. It lets you write JSX embedded inside markdown. That's a great combination because it allows you to use markdown's often terse syntax (such as # heading) for the little things and JSX for more advanced components.

Read more about Gatsby+MDX [here.](https://gatsby-mdx.netlify.com/)

In your _theme_ directory, add src/pages/index.mdx

Then you need to add gatsby-plugin-mdx and MDX as dependencies.

`yarn workspace theme add gatsby-plugin-mdx @mdx-js/mdx @mdx-js/react`

Next, you will want to add gatsby-plugin-page-creator

`yarn workspace theme add gatsby-plugin-page-creator`

> Gatsby plugin that automatically creates pages from React components in specified directories. Gatsby includes this plugin automatically in all sites for creating pages from components in src/pages. With this plugin, any file that lives in the src/pages folder (or subfolders) will be expected to export a React Component to generate a Page.

In the future, Gatsby will automatically handle adding the page-creator plugin.

Read more about the page-creator plugin [here.](/packages/gatsby-plugin-page-creator/)

Next, you will want to create your _gatsby-config.js_ file under your _theme_ directory. Make sure to include 'gatsby-plugin-mdx' and 'gatsby-plugin-page-creator.'

```javascript:title=packages/theme/gatsby-config.js
const path = require(`path`)

module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-mdx`,
      options: {},
    },
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: path.join(__dirname, `src/pages`),
      },
    },
  ],
}
```

Lastly, you're going to want to add a _gatsby-config.js_ file to your _site_ directory.

```javascript:title=site/gatsby-config.js
module.exports = {
  plugins: [`theme`],
}
```

### Setting up Site `package.json`

You will need to add `gatsby` CLI scripts and specify your newly created `theme` as a dependency.

```json:title=site/package.json
{
  "name": "site",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    // highlight-start
    "develop": "gatsby develop",
    "build": "gatsby build"
    // highlight-end
  },
  "dependencies": {
    "gatsby": "^2.3.34",
    "react": "^16.8.6",
    "react-dom": "^16.8.6",
    // highlight-start
    "theme": "*"
    // highlight-end
  }
}
```

Now, you can make sure _site_ is linked to _theme_.

```shell
yarn
yarn workspaces info
```

Your workspace info should look similar to this:

```json
{
  "site": {
    "location": "site",
    "workspaceDependencies": ["theme"],
    "mismatchedWorkspaceDependencies": []
  },
  "theme": {
    "location": "packages/theme",
    "workspaceDependencies": [],
    "mismatchedWorkspaceDependencies": []
  }
}
```

### Run the Site

Now that we've set up the site's _package.json_ we can run the workspace:

```shell
yarn workspace site develop
```

### Customizing the Index Page

You can override the index page from your theme by creating one in site. To do so, change directory into
the _site_ directory, and create an _index.mdx_ file in the pages folder.

`site/src/pages/index.mdx`

Your website content goes in _index.mdx_.

Now, rerun the development server and see your new content:

```shell
yarn workspace site develop
```

## Styling Layout and Components

Next, you will navigate to the _theme_ directory. You will then create a _components_ folder under _src_, and in components you create a _layout.js_ file.

`packages/theme/src/components/layout.js`

Inside of your _layout.js_ file, you can add your styling.

```jsx:title=packages/theme/src/components/layout.js
export default function Layout({ children }) {
  return (
    <div
      style={{
        // Layout styling
        margin: `10%`,
        backgroundColor: `#fafafa`,
      }}
    >
      {children}
    </div>
  )
}
```

To make sure your _layout.js_ file is connected to your theme you will navigate to your _gatsby-config.js_ file in your _theme_ directory. You will add defaultLayouts under options and make sure that the _layout.js_ is required.

```javascript:title=packages/theme/gatsby-config.js
const path = require(`path`)

module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        // highlight-start
        defaultLayouts: {
          default: require.resolve(`./src/components/layout.js`),
        },
        // highlight-end
      },
    },
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: path.join(__dirname, `src/pages`),
      },
    },
  ],
}
```

If you want to reuse a specific style, you can create styled components. In your components directory, you will create a new file (for example: _header.js_).

Here is an example of how you can set-up your styled component in _header.js_. Please make sure you write css-in-javascript when styling your div.

```jsx:title=header.js
export default function Header({ children }) {
  return (
    <section
      style={{
        // Header Specific Styling //
        padding: "10px",
        backgroundColor: "blue",
      }}
    >
      {children}
    </section>
  )
}
```

To import your styled components, go to _index.js_ and export your component.

```javascript:title=packages/theme/index.js
export { default as Header } from "./src/components/header"
```

If you want to use this component in your site, you will then go to your page (_index.mdx_) and import the specific components.

`import { Header } from 'theme';`
You can then use it to style specific things in your file.

```mdx
<Header>Header content goes here</Header>
```

## Using Your Theme

It's finally time to use and share your theme! You can push your whole directory (_gatsby-themes_) to GitHub.

If you ever want to use your theme, you will do:

`gatsby new name-of-project theme-url`

Once you have cloned this theme into your new project, you can make edits to the files in your pages folder.

If you want to check your progress, go to the _site_ directory and

`gatsby develop`

Once your server is up you should see your beautiful theme applied to your files!

### Troubleshooting Plugin Errors

If you run into an error that your theme plugin can't be found, try clearing your cache. You can either use `rm -rf .cache` in your terminal, or you can add:

```json
{
  "scripts": {
    "clean": "gatsby clean"
  }
}
```

to your _package.json_ file. Then you can use `npm run clean` in your terminal.

If you happen to find this tutorial helpful, please feel free to let me know on Twitter [@KatieFujihara](https://www.twitter.com/KatieFujihara)! I would love to see what kind of themes you build.
