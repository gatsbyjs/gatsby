---
title: "Life Before and After Gatsby Recipes"
date: 2020-07-20
author: Khaled Garbaya
excerpt: "Recipes are designed to make life as a Gatsby developer even easier, and Khaled Garbaya shows exactly how much. He walks through setting up a Contentful blog with TailwindCSS before and after Gatsby Recipes -- taking us from seven steps to just one."
tags:
  - gatsby-recipes
  - mdx
  - building-sites-faster
  - contentful
---

The Gatsby ecosystem is prosperous with plugins and themes, which I love...But sometimes all this abundance can actually become a problem. For example, when trying to identify and assemble all the pieces needed to achieve your goals for a new project.

Proper documentation helps to solve this but it is hard to keep docs always up to date. Also, this approach often means simply copy-pasting commands into your terminal without understanding what they do. The process becomes a bit tedious.

Instead, wouldn't it be nice if you could make the setup instructions more interactive and automated? Where people can read through, learn how it all works, and set up their projects at the same time?

Enter: Gatsby Recipes

Gatsby Recipes [launched just recently](/blog/2020-04-15-announcing-gatsby-recipes/) to help automate everyday tasks like creating pages and layouts, installing and setting up plugins, adding a blog to a site, setting up Typescript, and many more routine tasks. With the release of this new feature, which is run from the CLI, Gatsby has created [25+ official recipes](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-recipes/recipes) that you can explore, including Theme UI, Sass, Cypress, animated page transitions, and persistent layout components. And since then, because they are so useful but also fun and easy to create, the community has also been busy contributing all kinds of other useful Recipes.

## Gatsby, Before Recipes: A long and winding workflow

For a few years now, my go-to stack when building apps has been Gatsby as my primary framework, [TailwindCSS](https://tailwindcss.com/) for styling, and Contentful as the data source. (I know that there are many other styling options out there, [styled-components](https://styled-components.com/) is a great one, but I personally like to keep my CSS as low level as possible).

Even if this setup looks straightforward, I always struggle the first 20 minutes fiddling around with config files and plugins to get TailwindCSS working properly. No matter how many times I've used this workflow, I still forget how I did it last time or manage to miss one small step.

Here's is the process for getting TailwindCSS working in your Gatsby project:

1. Install TailwindCSS:

```shell
npm install tailwindcss gatsby-plugin-postcss
```

2. Add `gatsby-plugin-postcss` to your `gatsby-config.js` file

```javascript:title=gatsby-config.js
{
  plugins: [`gatsby-plugin-postcss`]
}
```

3. Create a `postcss.config.js` file and add the following snippet to it:

```javascript:title=postcss.config.js
module.exports = {
  plugins: [require("tailwindcss"), require("autoprefixer")],
}
```

4. Create a `tailwind.config.js` file and add the following snippet to it:

```javascript:title=tailwind.config.js
module.exports = {
  purge: ["./src/**/*.js"],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
}
```

5. Create a `tailwind.css` file and add the following snippet to it:

```css:title=tailwind.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

6. Next in our stack comes Contentful. In order to add Contentful to your Gatsby project you first need to install `gatsby-source-plugin`:

   ```shell
   npm install gatsby-source-plugin
   ```

7. Get the credentials from your Contentful space, and add the plugin in your `gatsby-config.js` file. (Excellent [guidance for setting up Contentful + Gatsby](https://www.gatsbyjs.com/guides/contentful/) is already detailed in the Gatsby docs, so we won't go into that here).

8. _Just kidding, there is no step eight. Seven steps is enough!_ I don't know about you, but there is no way I manage to get through this process each time without making a typo somewhere or forgetting one of the steps. I even forgot one small step when first typing out the above list, which is importing the `tailwind.css` file into your layout file.

There are a few ways we could possibly avoid doing this manual process. One would be to create a boilerplate or a starter project and clone it with each new project. Unfortunately this then creates its own set of problems: first, it's a chore keeping starters up to date. Also, they only work well with fresh new projects. Even when they do work, starters can be very opinionated and force you to use extra stuff that you don't need.

Let's take the example of a Contentful starter. You run something like `gatsby new gatsby-site https://github.com/contentful-userland/gatsby-contentful-starter` and you end up with this [project](https://contentful-userland.github.io/gatsby-contentful-starter/):

![landing page for sample site made with the Gatsby Contentful starter](./Gatsby-Contentful-starter.png)

The project itself is excellent, but it still requires changing multiple files to get to a good starting point. First, we need to delete all the artworks and images. Second, change the site metadata. Third, change the text in the footer. Fourth, we need to change the header, including the navigation. Finally we need to remove any extra unneeded pages.

Don't get me wrong -- starters are amazing. But they try to do too many jobs, setting up your Gatsby project while also acting as a demo for the setup. You can only use one starter in your project, so you also need to be lucky enough to find one that combines all the features you want -- without a whole bunch that you _don't_ want.

## Gatsby, After Recipes: Three little words

All those steps we just went through above? (Well, the ones we remembered, anyway). Now that Recipes are here, all that setup can be replaced with three little words: `gatsby recipe tailwind`.

https://twitter.com/kylemathews/status/1256258010717941760

Recipes are written in MDX, which is a great choice. MDX makes Gatsby Recipes instructions and explanations easily readable for humans while using React components syntax to declare desired state.

You can combine recipes in your Gatsby project at any stage of the project. And, since this can be a pure configuration, it won't affect your work in progress!

Gatsby Recipes allow users like me to create even more advanced configuration, while at the same time keeping the entry-level barrier very low -- even for first-time users.

## Where to go from here

If you want to get started with Gatsby Recipes, I created a [free 6 min egghead.io collection](https://egghead.io/playlists/getting-started-with-gatsbyjs-recipes-c79a) to help you with that. Make sure to check out this helpful [Recipes blog post](/blog/2020-05-21-gatsby-recipes/) on the Gatsby site. If you're having fun with Recipes and would like to contribute, [visit the umbrella issue](https://github.com/gatsbyjs/gatsby/issues/22991) to find out more.
