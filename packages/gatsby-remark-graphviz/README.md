# gatsby-remark-graphviz

Processes [graphviz](https://www.graphviz.org/) (`dot` and `circo`) code blocks in your markdown files and replaces them with the rendered SVG using [viz.js](https://github.com/mdaines/viz.js/)

![demo gif](/plugins/gatsby-remark-graphviz/demo.gif)

## Install

`npm install gatsby-remark-graphviz`

Note that you do **not** need graphviz installed on your machine as this project depends on viz.js which is a pure JavaScript port of graphviz.

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: 'gatsby-transformer-remark',
    options: {
      plugins: [
        'gatsby-remark-graphviz',
        // place before other plugins that modify code blocks (such as prismjs)
        // 'gatsby-remark-prismjs',
      ]
    }
  }
],
```

Then, add `dot` code blocks to your markdown. E.g

    ```dot
    digraph graphname {
      a -> b;
      b -> c;
      a -> c;
    }
    ```

Which will be rendered using viz.js and the output html will replace the code block with the actual SVG.

![rendered-graph](/plugins/gatsby-remark-graphviz/rendered-graph.svg)

Custom attributes can be passed to the rendered SVG:

    ```dot id="my-id" class="my-class"
    digraph graphname {
      a -> b;
      b -> c;
      a -> c;
    }
    ```

By default, the following inline style is applied to all rendered SVGs in order to make them responsive:

```css
max-width: 100%;
height: auto;
```

This can be overwritten by using the custom attributes feature:

    ```dot style=""
    digraph graphname {
      a -> b;
      b -> c;
      a -> c;
    }
    ```

## Caveats

In your gatsby-config.js, make sure you place this plugin before other remark plugins that modify code blocks (like prism).

## Alternatives

If you want a broader range of drawing options, checkout [gatsby-remark-draw](https://www.npmjs.com/package/gatsby-remark-draw). It provides SvgBobRus, Graphviz, and Mermaid, but note that you must have these already installed on your system

If you're simply looking for a normal (not Gatsby) remark plugin for graphviz, see [remark-graphviz](https://www.npmjs.com/package/remark-graphviz) which inspired this plugin.
