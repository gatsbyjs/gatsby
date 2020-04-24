# Gatsby Recipes

Gatsby Recipes is framework for automating common Gatsby tasks. Recipes are MDX
files which, when run by our interpretor, perform common actions like installing
NPM packages, installing plugins, creating pages, etc.

It's designed to be extensible so new capabilities can be added which allow
Recipes to automate more things.

We chose MDX to allow for a literate programming style of writing recipes which
enables us to port our dozens of recipes from
https://www.gatsbyjs.org/docs/recipes/ as well as in the future, entire
tutorials.

[Read more about Recipes on the launch blog post](https://www.gatsbyjs.org/blog/2020-04-15-announcing-gatsby-recipes/)

There's an umbrella issue for testing / using Recipes during its incubation stage.

Follow the issue for updates!

https://github.com/gatsbyjs/gatsby/issues/22991

## Recipe setup

Upgrade the global gatsby-cli package to the latest with recipes.

```shell
npm install -g gatsby-cli@latest
```

To confirm that this worked, run `gatsby --help` in your terminal. The output should show the recipes command.

### Running an example recipe

Now you can test out recipes! Start with a recipe for installing `emotion` by following these steps:

1. Create a new Hello World Gatsby site:

```shell
gatsby new try-emotion https://github.com/gatsbyjs/gatsby-starter-hello-world
```

1. Navigate into that project directory:

```shell
cd try-emotion
```

1. Now you can run the `emotion` recipe with this command:

```shell
gatsby recipes emotion
```

![Terminal showing "gatsby recipes emotion" output](https://user-images.githubusercontent.com/1424573/79452177-f3362f00-7fa4-11ea-903a-e28472bf95b6.png)

You can see a list of other recipes to run by running `gatsby recipes`

![Terminal showing recipes list](https://user-images.githubusercontent.com/1424573/79452254-14971b00-7fa5-11ea-9bdf-021c341afb10.png)

## Developing Recipes

### An example MDX recipe

Here's how you would write the `gatsby recipes emotion` recipe you just ran:

```mdx
# Setup Gatsby with Emotion

[Emotion](https://emotion.sh/) is a powerful CSS-in-JS library that supports both inline CSS styles and styled components. You can use each styling feature individually or together in the same file.

<!-- use three dashes to separate steps of the recipe -->

---

Install necessary NPM packages

<!-- refer to the API in this doc to see what APIs are available, like `NPMPackage` -->

<NPMPackage name="gatsby-plugin-emotion" />
<NPMPackage name="@emotion/core" />
<NPMPackage name="@emotion/styled" />

---

Install the Emotion plugin in gatsby-config.js

<GatsbyPlugin name="gatsby-plugin-emotion" />

---

Sweet, now it's ready to go.

Let's also write out an example page you can use to play
with Emotion.

<File
  path="src/pages/emotion-example.js"
  content="https://gist.githubusercontent.com/KyleAMathews/323bacd551df46e8e7b6146cbf827d0b/raw/5c60f168f30c505cff1ff2433e69dabe27ae9738/sample-emotion.js"
/>

---

Read more about Emotion on the official Emotion docs site:

https://emotion.sh/docs/introduction
```

You can browse the [source of the official recipes](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-recipes/recipes). The [recipes umbrella issue](https://github.com/gatsbyjs/gatsby/issues/22991) also has a number of recipes posted by community members.

### How to run recipes

You can run built-in recipes, ones you write locally, and ones people have posted online.

To run a local recipe, make sure to start the path to the recipe with a period like `gatsby recipes ./my-cool-recipe.mdx`

To run a remote recipe, just paste in the path to the recipe e.g. `gatsby recipes https://example.com/sweet-recipe.mdx`

### Recipe API

#### `<GatsbyPlugin>`

Installs a Gatsby Plugin in the site's `gatsby-config.js`.

Soon will support options.

```jsx
<GatsbyPlugin name="gatsby-plugin-emotion" />
```

##### props

- **name** name of the plugin

#### `<GatsbyShadowFile>`

```jsx
<GatsbyShadowFile theme="gatsby-theme-blog" path="src/components/seo.js" />
```

##### props

- **theme** the name of the theme (or plugin) which provides the file you'd like to shadow
- **path** the path to the file within the theme. E.g. the example file above lives at `node_modules/gatsby-theme-blog/src/components/seo.js`

#### `<NPMPackage>`

`<NPMPackage name="lodash" version="latest" />`

##### props

- **name**: name of the package(s) to install. Takes a string or an array of strings.
- **version**: defaults to latest
- **dependencyType**: defaults to `production`. Other options include `development`

#### `<NPMScript>`

`<NPMScript name="test" command="jest" />`

##### props

- **name:** name of the command
- **command** the command that's run when the script is called

#### `<File>`

<File path="test.md" content="https://raw.githubusercontent.com/KyleAMathews/test-recipes/master/gatsby-recipe-jest.mdx" />

##### props

- **path** path to the file that should be created. The path is local to the root of the Node.js project (where the package.json is)
- **content** URL to the content that should be written to the path. Eventually we'll support directly putting content here after some fixes to MDX.

> Note that this content is stored in a [GitHub gist](https://gist.github.com/). When linking to a gist you'll want to click on the "Raw" button and copy the URL from that page.

## Resources

- A free 6 min eggheadio [collection](https://egghead.io/playlists/getting-started-with-gatsbyjs-recipes-c79a) by [Khaled Garbaya](https://twitter.com/khaled_garbaya)

## FAQ / common issues

### Q) My recipe is combining steps instead of running them seperately!

We use the `---` break syntax from Markdown to separate steps.

One quirk with it is for it to work, it must have an empty line above it.

So this will work:

```mdx
# Recipes

---

a step

<File src="something.txt" content="something" />
```

But this won't

<!-- prettier-ignore-start -->
```mdx
# Recipes
---

a step

<File src="something.txt" content="something" />
```
<!-- prettier-ignore-end -->

### Q) What kind of recipe should I write?

If you’d like to write a recipe, there are two great places to get an idea:

- Think of a task that took you more time than other tasks in the last Gatsby site you built. Is there a way to automate any part of that task?
- Look at this list of recipes in the Gatsby docs. Many of these can be partially or fully automated through creating a recipe `mdx` file. https://www.gatsbyjs.org/docs/recipes/
