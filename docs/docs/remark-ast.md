---
title: Manipulating Remark ASTs
---

gatsby-transformer-remark empowers developers to translate markdown into html to be consumed throughout Gatsby pages. Blogs and other content based sites can highly benefit from this so the code and content is separated and creators don't need.

In certain instances, a developer may want to customize certain markdown nodes while being parsed. Examples could include [add syntax highlighting](/packages/gatsby-remark-prismjs/), [parse images](/packages/gatsby-remark-images), [embed videos](/packages/gatsby-remark-embed-video) and plenty of others. Throughout all of these instances, a plugin will examine the markdown Abstract Syntax Tree (AST) and manipulate content based on certain node types or content in particular nodes.

## What will be learned in this tutorial

- How to learn how to understand the remark AST
- How to integrate plugins with `gatsby-transformer-remark`
- How to manipulate the remark AST to add additional functionality.

## Understanding the Syntax Tree

To get an understanding at what is available in the Markdown AST, take a look at the markdown ast spec that is used in remark and other unist projects: [syntax-tree/mdast](https://github.com/syntax-tree/mdast).

Starting out with a markdown file as below

```markdown
# Hello World!

This is a [Real page](https://google.com)
```

the generated `markdownAST` would be as appears:

```JSON
{
  "type": "root",
  "children": [
    {
      "type": "heading",
      "depth": 1,
      "children": [
        {
          "type": "text",
          "value": "Hello World!",
          "position": {
            "start": { "line": 1, "column": 3, "offset": 2 },
            "end": { "line": 1, "column": 15, "offset": 14 },
            "indent": []
          }
        }
      ],
      "position": {
        "start": { "line": 1, "column": 1, "offset": 0 },
        "end": { "line": 1, "column": 15, "offset": 14 },
        "indent": []
      }
    },
    {
      "type": "paragraph",
      "children": [
        {
          "type": "text",
          "value": "This is a ",
          "position": {
            "start": { "line": 3, "column": 1, "offset": 16 },
            "end": { "line": 3, "column": 11, "offset": 26 },
            "indent": []
          }
        },
        {
          "type": "link",
          "title": null,
          "url": "https://google.com",
          "children": [
            {
              "type": "text",
              "value": "Real page",
              "position": {
                "start": { "line": 3, "column": 12, "offset": 27 },
                "end": { "line": 3, "column": 21, "offset": 36 },
                "indent": []
              }
            }
          ],
          "position": {
            "start": { "line": 3, "column": 11, "offset": 26 },
            "end": { "line": 3, "column": 42, "offset": 57 },
            "indent": []
          }
        }
      ],
      "position": {
        "start": { "line": 3, "column": 1, "offset": 16 },
        "end": { "line": 3, "column": 42, "offset": 57 },
        "indent": []
      }
    }
  ],
  "position": {
    "start": { "line": 1, "column": 1, "offset": 0 },
    "end": { "line": 4, "column": 1, "offset": 58 }
  }
}
```

## Setting up a plugin

For example, we are going to create a plugin that colors all top level headings in the markdown with the color purple.

First create a local plugin by adding a `plugins` folder in your site and generating a package.json file for it. As well, create an index.js file. In this file, it will export a single function.

```js
module.exports = ({ markdownAST }, pluginOptions) => {
  // Manipulate AST

  return markdownAST
}
```

The first parameter is all of the default properties that can be used in plugins (actions, store, getNodes, schema, etc.) plus a couple just for gatsby-transformer-remark plugins. The one to be focused on is the `markdownAST` field which is destructured in the code snippet above.

As with other Gatsby plugins, the 2nd parameter is the pluginOptions which is obtained from the definition in `gatbsy-config.js` file.

Finally, the function will return the markdownAST after the fields you wish to be edited are transformed.

## Adding the plugin to your site

You likely will want to grab `gatsby-source-filesystem` to grab the file nodes initally. in this example I am going to assume the markdown files we are working with exist in `src/data/`.

The plugin is now initally set so we can add it as a sub-plugin inside `gatsby-transformer-remark`

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: `data`,
        path: `${__dirname}/src/data/`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [`gatsby-remark-colorize-headers`],
      },
    },
  ],
}
```

If we wanted to add some options, we could switch to the object syntax:

```js
{
  resolve: `gatsby-remark-colorize-headers`,
  options: {
    // Options here
  }
}
```

## Find and Modify Markdown Nodes

When modifying nodes, you'll want to walk the tree and then implement new functionality on specific nodes.

A node module to help with is [unist-util-visit](https://github.com/syntax-tree/unist-util-visit), a walker for `unist` nodes. For reference, Unist which stands for United Syntax Tree is a standard for markdown syntax trees and parsers that include well known parsers in the Gatsby world like Remark and MDX.

As an example from `unist-util-visit`'s readme, it allows for an easy interface to visit particular nodes based on a particular type:

```js
var remark = require("remark")
var visit = require("unist-util-visit")

var tree = remark().parse("Some _emphasis_, **importance**, and `code`.")

visit(tree, "text", visitor)

function visitor(node) {
  console.log(node)
}
```

Here, it finds all text nodes and will `console.log` the nodes.

Now with this, we can take the AST from our plugin and get working on adding functionality for headers:

```js
const visit = require("unist-util-visit")

module.exports = ({ markdownAST }, pluginOptions) => {
  visit(markdownAST, "heading", node => {
    // Do stuff with heading nodes
  })

  return markdownAST
}
```

Now we will visit all heading nodes and pass it into a transformer function which we can do whatever we wish.

Looking again at the AST node for header:

```JSON
{
  "type": "heading",
  "depth": 1,
  "children": [
    {
      "type": "text",
      "value": "Hello World!",
      "position": {
        "start": { "line": 1, "column": 3, "offset": 2 },
        "end": { "line": 1, "column": 15, "offset": 14 },
        "indent": []
      }
    }
  ],
  "position": {
    "start": { "line": 1, "column": 1, "offset": 0 },
    "end": { "line": 1, "column": 15, "offset": 14 },
    "indent": []
  }
},
```

We have context about the text as well as what depth the header is (for instance here we have a depth of 1 which would equate to an `h1` element)

## Loading in changes and seeing effect.

After doing such, we setup some pages to be programatically created from markdown as shown in [Part 7 of the Gatsby Tutorial](/tutorial/part-seven/). Once this is set up, we can examine that our colorize-headers plugin works as seen below.

TODO: Add result image

## Publishing the plugin

To be shared with others, we can extract the plugin to it's own directory outside of this site and then publish it to NPM so it can be accessed both on NPM and viewable in the [Plugin Library](/plugins/).

## Summary

TODO

```

```
