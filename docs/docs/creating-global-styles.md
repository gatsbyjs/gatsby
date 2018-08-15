---
title: Creating global styles
---

In this guide, we'll walk through using traditional global styles in your site.

First, open a new terminal window and run the following commands to create a new default Gatsby site and start the development server:

```shell
gatsby new global-style-tutorial https://github.com/gatsbyjs/gatsby-starter-default#v2
gatsby develop
```

Second, create a css file and define any styles you wish. An arbitrary example:

```css
    html {
        background-color: lavenderblush;
    }

    a {
        color: rebeccapurple;
    }
```

Then, include the stylesheet in your site's `gatsby-browser.js` file.

```javascript
import './src/styles/global.css'

// or:
// require('./src/styles/global.css')
```

> _Note: You can use Node.js require or import syntax. Additionally, the placement of the example css file in a `src/styles` folder is arbitrary._

You should see your global styles taking effect across your site:

![Global styles example site](./images/global-styles-example.png)
