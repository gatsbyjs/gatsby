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

[Read more about Recipes on the RFC](https://github.com/gatsbyjs/gatsby/pull/22610)

There's an umbrella issue for testing / using Recipes during its incubation stage.

Follow the issue for updates!

https://github.com/gatsbyjs/gatsby/issues/22991

## How to write a recipe

Let's write our first Recipe to setup Emotion on a Gatsby site.

```mdx
# Setup Gatsby with Emotion

[Emotion](https://emotion.sh/) is a powerful CSS-in-JS library that supports both inline CSS styles and styled components. You can use each styling feature individually or together in the same file.

--- // use three dashes to separate steps of the recipe

Install necessary NPM packages

<NPMPackage name="gatsby-plugin-emotion" /> // refer to the API in this doc to see what APIs are available, like `NPMPackage`
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

Let's try running out this Recipe!

First create a new Hello World Gatsby site:

`gatsby new try-emotion https://github.com/gatsbyjs/gatsby-starter-hello-world`

Meanwhile also upgrade the global gatsby-cli package to use the one with new recipes command.

`npm install -g gatsby-cli@recipes`

Once the global finishes installing, running `gatsby -v` should show this as your version: `Gatsby CLI version: 2.11.4-recipes.53`

Upgrade the version of Gatsby installed to use one with Recipes.

`yarn add gatsby@recipes`

Now run the Emotion recipe and follow the commands.

`gatsby recipes emotion`

## Ways to run Recipes

You can run built-in Recipes, ones you write locally, and ones people have posted online.

To run a local recipe, make sure to start the path to the recipe with a period like `gatsby recipes ./my-cool-recipe.mdx`

To run a remote recipe, just paste in the path to the recipe e.g. `gatsby recipes https://example.com/sweet-recipe.mdx`

## How to write your own

### API

#### `<GatsbyPlugin>`

Installs a Gatsby Plugin in the site's `gatsby-config.js`.

Soon will support options.

```jsx
<GatsbyPlugin name="gatsby-plugin-emotion" />
```

##### props

- **name** name of the plugin

#### `<NPMPackage`

`<NPMPackage name="lodash" version="latest" />`

##### props

- **name**: name of the package(s) to install. Takes a string or an array of strings.
- **version**: defaults to latest
- **dependencyType**: defaults to `dependency`. Other options include `devDependency`

#### `<NPMScript>`

`<NPMScript name="test" command="jest" />`

##### props

- **name:** name of the command
- **command** the command that's run when the script is called

#### `<File>`

<File path="test.md" content="https://raw.githubusercontent.com/KyleAMathews/test-recipes/master/gatsby-receipe-sass.mdx" />

##### props

- **path** path to the file that should be created. The path is local to the root of the Node.js project (where the package.json is)
- **content** URL to the content that should be written to the path. Eventually we'll support directly putting content here after some fixees to MDX.
