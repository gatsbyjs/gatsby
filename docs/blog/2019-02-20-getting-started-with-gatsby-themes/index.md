---
title: Getting Started with Gatsby Themes and MDX
date: 2019-02-20
author: Katie Fujihara
tags: ["themes", "tutorials"]
---
### What is a Gatsby theme?
> Gatsby themes allow you to focus only on the parts of the site and app building process that you need to care about by abstracting the rest away into a package. -Jason Lengstorf

# Getting Started

Create a new directory

```mkdir gatsby-themes```

Navigate to the directory

```cd gatsby-themes```

Create a *package.json* file

```npm init```

Tidy up your *package.json* file and create workspaces which includes the project name, site, and your packages. Both of these directories will include their own *package.json* files.

```
{
"name": "gatsby-theme",
"private": true,
"version": "1.0.0",
"workspaces" : [
"site",
"packages/*"
    ]
}
```

Next, you want to create your *site* directory and your *packages* directory within your *gatsby-theme* project directory. Make sure the names that you choose for your directories are the same as what you put in your workspaces. You will also want to go into your packages directory and make another directory with the name of your theme. For the purpose of this tutorial, we can will call it *theme*. Then you will want to ```yarn init``` the *theme* directory and the *site* directory.

```
mkdir site
mkdir packages
cd packages
mkdir theme
cd theme
yarn init
cd ../../site/
yarn init
```

After using ```yarn init``` you will be asked a few questions. The main thing you will want to pay attention to is the entry point (index.js). For the *theme* directory, you can leave the entry point as *index.js* (just make sure you have an *index.js* file) and for the *site* directory, you can make entry point *gatsby-config.js*. Next, you will want to go into your *site* directory and do ```yarn workspace site add gatsby```.

Hooray! Gatsby should now be added to your site directory if you look in your *package.json* file. Adjustments you make to your file is adding "scripts" and adding the name of your Gatsby theme, in this case, *theme*, to your dependencies.

```
{
"name": "site",
"version": "0.0.1",
"description": "A site used to play with Gatsby themes",
"main": "gatsby-config.js",
"license": "MIT",
"scripts":{
"develop": "gatsby develop",
"build": "gatsby build"
    },
"dependencies": {
"gatsby": "^2.0.118",
"theme":"*"
    }
}
```

You will want to add Gatsby, React, and ReactDOM to as dev dependencies for *site*.

```yarn workspace site add gatsby react react-dom -D```

Then you will navigate out of the *site* directory and add Gatsby, React, and ReactDOM as dev dependencies for *theme*.

```yarn workspace theme add gatsby react react-dom -D```

You will want to make Gatsby, React, and ReactDom peer dependencies in both the *site* and *theme* directories.

```
"devDependencies": {
"gatsby": "^2.0.118",
"react": "^16.8.1",
"react-dom": "^16.8.1"
},
"peerDependencies": {
"gatsby": "^2.0.118",
"react": "^16.8.1",
"react-dom": "^16.8.1"
}
```

# Installing MDX and gatsby-plugin-page-creator
### What is MDX?
> MDX is markdown for the component era. It lets you write JSX embedded inside markdown. That's a great combination because it allows you to use markdown's often terse syntax (such as # heading) for the little things and JSX for more advanced components.

Read more about Gatsby+MDX [here.](https://gatsby-mdx.netlify.com/)

In your *theme* directory, add src/pages/index.mdx

Then you need to add gatsby-mdx and MDX as dependencies.

```yarn workspace theme add gatsby-mdx @mdx-js/mdx @mdx-js/tag```

Next, you will want to add gatsby-plugin-page-creator

```yarn workspace theme add gatsby-plugin-page-creator```

> Gatsby plugin that automatically creates pages from React components in specified directories. Gatsby includes this plugin automatically in all sites for creating pages from components in src/pages. With this plugin, any file that lives in the src/pages folder (or subfolders) will be expected to export a React Component to generate a Page.

Read more about the page creator plugin [here.](/packages/gatsby-plugin-page-creator/)

Next, you will want to create your *gatsby-config.js* file under your *theme* directory. Make sure to include 'gatsby-mdx' and 'gatsby-plugin-page-creator.'

```
module.exports = {
  plugins: [
    {
      resolve: `gatsby-mdx`,
    },
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: `${__dirname}/src/pages`,
      },
    },
  ],
}

``` 

Now, to make sure *site* is linked to *theme*.

```
yarn
yarn workspaces info
```

Your workspace info should look similar to this:

```
{
"site": {
"location": "site",
"workspaceDependencies": [
"theme"
],
"mismatchedWorkspaceDependencies": []
},
"theme": {
"location": "packages/theme",
"workspaceDependencies": [],
"mismatchedWorkspaceDependencies": []
}
}
```

Lastly, you're going to want to add a *gatsby-config.js* file to your *site* directory.

```
module.exports = {
__experimentalThemes: ["theme"]
}
```

While you're still in the *site* directory, you are going to create an *index.mdx* file in the pages folder.

```site/src/pages/index.mdx```

Your website content goes in *index.mdx*.

# Styling Layout and Components
Next, you will navigate to the *theme* directory. You will then create a *components* folder under *src*, and in components you create a *layout.js* file.

```packages/theme/src/components/layout.js```

Inside of your *layout.js* file, you can add your styling.

```
import React from "react"
export default ({children}) =>
<section style={{
STYLING GOES HERE
}}>
{children}
</section>
```

To make sure your *layout.js* file is connected to your theme you will navigate to your *gatsby-config.js* file in your *theme* directory. You will add defaultLayouts under options and make sure that the *layout.js* is required.

```
module.exports = {
  plugins: [
    {
      resolve: `gatsby-mdx`,
      options: {
        defaultLayouts:{
          default: require.resolve('./src/components/layout.js')
        }
      },
    },
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: `${__dirname}/src/pages`,
      },
    },
  ],
}
```

If you want to reuse a specific style, you can create styled components. In your components directory, you will create a new file (for example: *header.js*).

Here is an example of how you can set-up your styled component in *header.js*. Please make sure you write css-in-javascript when styling your div.

```
import React from 'react';
export default({children}) => (
<div style={{
HEADER SPECIFIC CSS
}}>
{children}
</div>
)
```

To import your styled components, go to *index.js*

```packages/theme/index.js```

You will then export your component.

```export {default as Header} from './src/components/header'```

If you want to use this component in your site, you will then go to your page (*index.mdx*) and import the specific components.

```import { Header } from 'theme';```
You can then use it to style specific things in your file.

```
import { Header } from 'theme';

<Header>Header content goes here</Header>
```

# Using Your Theme

It's finally time to use and share your theme! You can push your whole directory (*gatsby-themes*) to GitHub. 

If you ever want to use your theme, you will do:

```gatsby new name-of-project theme-url```

Once you have cloned this theme into your new project, you can make edits to the files in your pages folder. 

If you want to check your progress, go to the *site* directory and

```gatsby start```

Once your server is up you should see your beautiful theme applied to your files!

## If you happen to find this tutorial helpful, please feel free to let me know on Twitter [@KatieofCode](www.twitter.com/katieofcode)! I would love to see what kind of themes you build.