---
title: Component CSS
---

### Component CSS

Gatsby has a wealth of options available for styling components. This example will explore one very popular and useful method: CSS Modules - [homepage](https://github.com/css-modules/css-modules). If you would like to see a more in-depth tutorial, please refer to [the Component CSS tutorial](/tutorial/part-two/#component-css).

### CSS Module Example

CSS Modules enable the use of writing normal CSS safely. Gone are the worries of selector name collisions.

There are two important parts in utilizing CSS Modules. Since it works out of the box with Gatsby, all you need are:

- A React component
- A `module.css` file

For the sake of an example, a `module.css` file called `container.module.css` will be created under a new directory called `src/components` with the following contents.

```css:title=src/components/container.module.css
.container {
  margin: 3rem auto;
  max-width: 600px;
}
```

Now, a React component called `Container` (`container.js`) will be created in the same directory `src/components` with the following contents. Make note that the `module.css` file created earlier is imported.

```javascript:title=src/components/container.js
import React from "react"
import containerStyles from "./container.module.css"

export default ({ children }) => (
  <div className={containerStyles.container}>{children}</div>
)
```

Also make sure to notice that the `.container` style that you created is referred to as `containerStyles.container` because of the name of the import.

Following the same logic, you have the ability of creating multiple `module.css` files for multiple React components.

You may take a look at a more in-depth [Component CSS tutorial](/tutorial/part-two/#component-css) if you would like to see an example with explanation of multiple complex React components utilizing multiple `module.css` files and why you may want to use CSS Modules in your next project.

### CSS Modules and BEM

If you're used to writing CSS with the [BEM](http://getbem.com/) methodology, a quick thing to note is that CSS Modules camelizes class names that contain dashes.

For example: `block--modifier` turns into `blockModifier`.
