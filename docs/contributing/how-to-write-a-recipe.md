---
title: How to Write a Recipe
---

[Docs Recipes](/docs/recipes/) should act as discoverable, concise instructions for completing common Gatsby tasks without having to navigate elsewhere. They live in the [Recipes section](/docs/recipes/) in the docs, the source of which can be found in the [`docs/docs/recipes.md` landing page](https://github.com/gatsbyjs/gatsby/blob/master/docs/docs/recipes.md) and [`docs/docs/recipes/*` folder](https://github.com/gatsbyjs/gatsby/blob/master/docs/docs/recipes/) in the GitHub repo.

A recipe should list requirements and include a few short instructions to complete a task. It should omit boilerplate and list only directly related, actionable instructions inline. Recipes are smaller units than tutorials, each limited to a single feature or task. Multiple recipes could be linked from a reference guide or tutorial, however the content should be consolidated in the Recipes section for discoverability. If a recipe is recorded as a video, it should be less than five or ten minutes long.

The components of a recipe are:

- Overview link on [`recipes.md`](https://github.com/gatsbyjs/gatsby/blob/master/docs/docs/recipes.md)
- The name of the recipe, which should describe a single task
- A 1-2 sentence description motivating what the recipe is for
- Prerequisites and requirements
- Step-by-step directions
  - Optional embedded examples
- Links to additional resources

Recipes should be short. This is accomplished by limiting steps to what is unique to the task at-hand; prerequisites and requirements should be mentioned but not include install steps for things like npm or Gatsby CLI. Linking to full reference guide, tutorial, or a working example can complete the loop for anyone who needs more help.

If you're finding a recipe is becoming too long to fit on the Docs Recipes page due to including many prerequisites or steps, consider writing a tutorial instead.

## Recipe categories

Grouping recipes by topic will allow users to navigate and learn by subject matter. As recipes following the new format are introduced, you might find a section needs an h2 heading added for the group. The older-style recipes should be gradually replaced with actionable recipes following the template below.

Recipes should fall into these categories to start (suggest your idea in a GitHub issue!):

- Pages/Layouts
- Styling
- Using a starter
- Using themes
- Sourcing data
- Querying data
- Images
- Transforming data
- Deploying

Here's a template for a new recipe category:

```markdown:title=docs/docs/recipes.md
## Category name
```

## Recipe parts

### Overview link

To make sure your recipe is linked from the overview page, you must add it to the appropriate category in [`recipes.md`](https://github.com/gatsbyjs/gatsby/blob/master/docs/docs/recipes.md). Otherwise, it will be difficult for Gatsby users to find it, which isn't good for anyone!

### Title and description

To help motivate the purpose of a recipe, its title should clearly indicate the task being covered; not just the tool or API being used. E.g. "Using the StaticQuery Component" is more descriptive than "StaticQuery".

Descriptions should be 1-2 sentences long and expand on the title to further motivate why someone would want to follow this recipe.

### Prerequisites

Each recipe should include 2-5 requirements or prerequisites, some of which may not be explicitly required but are good to be aware of. These items should list any steps that must be done or checked before starting the recipe to keep it focused and succinct.

Each prerequisite should include only the _item_ or _thing_ needed, not the whole step (verbs like "installed").

Prerequisites example:

```markdown
- React and ReactDOM 16.8.0 or later (keeping Gatsby updated handles this)
- The [Rules of React Hooks](https://reactjs.org/docs/hooks-rules.html)
```

### Directions

The steps should list each part of the task in detail (omitting unrelated boilerplate or installation steps), and not skip or gloss over necessary details. Typically these steps are included with an ordered list. It's subjective whether to include a code snippet for each step, and will require your best judgement (ask for help in a PR if you're not sure). For some recipes, listing each individual step in text and including a single code snippet for the recipe makes sense to keep it short.

If a recipe issue recommends a live example such as a CodeSandbox embed, the recipe steps are the best place to include it.

### Additional resources

This is the place to link to related docs, tutorials, and additional examples.

## Recipe template

When writing a recipe, try to include each of the below items wherever relevant.

````markdown:title=docs/docs/recipes.md
### Recipe name

#### Prerequisites

- A Gatsby site with two page components: `index.js` and `contact.js`
- The Gatsby <Link /> component
- The Gatsby CLI method `gatsby develop`

#### Directions

1. Open the index page component (src/pages/index.js), import the <Link />
   component from Gatsby, add a <Link /> component above the header, and give
   it a `to` property with the value of "/contact/" for the pathname:

```jsx:title=src/pages/index.js
import React from "react"
import { Link } from "gatsby"

export default function Home() (
  <div style={{ color: `purple` }}>
    <Link to="/contact/">Contact</Link>
    <p>What a world.</p>
  </div>
)
```

2. Run `gatsby develop` and navigate to the index page. You should have a link
   that takes you to the contact page when clicked!

#### Additional resources

- Related docs/materials to check out
- Any other demos
````
