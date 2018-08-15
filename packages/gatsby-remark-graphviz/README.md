# gatsby-remark-graphviz

Processes [graphviz](https://www.graphviz.org/) (`dot` and `circo`) code blocks in your markdown files and replaces them with the rendered SVG using [viz.js](https://github.com/mdaines/viz.js/)

## Install

`npm install --save gatsby-remark-graphviz`

Note that you do **not** need graphviz installed on your machine as this project depends on viz.js which is a pure javascript port of graphviz.

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: 'gatsby-transformer-remark',
    options: {
      plugins: [
        'gatsby-remark-graphviz'
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

<svg width="89pt" height="188pt" viewBox="0.00 0.00 89.00 188.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(4 184)">
<title>graphname</title>
<polygon fill="#ffffff" stroke="transparent" points="-4,4 -4,-184 85,-184 85,4 -4,4" data-darkreader-inline-fill="" data-darkreader-inline-stroke="" style="--darkreader-inline-fill:#212127; --darkreader-inline-stroke:transparent;"></polygon>
<!-- a -->
<g id="node1" class="node">
<title>a</title>
<ellipse fill="none" stroke="#000000" cx="54" cy="-162" rx="27" ry="18" data-darkreader-inline-fill="" data-darkreader-inline-stroke="" style="--darkreader-inline-fill:none; --darkreader-inline-stroke:#e9e3d5;"></ellipse>
<text text-anchor="middle" x="54" y="-157.8" font-family="Times,serif" font-size="14.00" fill="#000000" data-darkreader-inline-fill="" style="--darkreader-inline-fill:#e9e3d5;">a</text>
</g>
<!-- b -->
<g id="node2" class="node">
<title>b</title>
<ellipse fill="none" stroke="#000000" cx="27" cy="-90" rx="27" ry="18" data-darkreader-inline-fill="" data-darkreader-inline-stroke="" style="--darkreader-inline-fill:none; --darkreader-inline-stroke:#e9e3d5;"></ellipse>
<text text-anchor="middle" x="27" y="-85.8" font-family="Times,serif" font-size="14.00" fill="#000000" data-darkreader-inline-fill="" style="--darkreader-inline-fill:#e9e3d5;">b</text>
</g>
<!-- a&#45;&gt;b -->
<g id="edge1" class="edge">
<title>a-&gt;b</title>
<path fill="none" stroke="#000000" d="M47.3258,-144.2022C44.2524,-136.0064 40.5384,-126.1024 37.1305,-117.0145" data-darkreader-inline-fill="" data-darkreader-inline-stroke="" style="--darkreader-inline-fill:none; --darkreader-inline-stroke:#e9e3d5;"></path>
<polygon fill="#000000" stroke="#000000" points="40.3858,-115.7274 33.5974,-107.593 33.8315,-118.1853 40.3858,-115.7274" data-darkreader-inline-fill="" data-darkreader-inline-stroke="" style="--darkreader-inline-fill:#e9e3d5; --darkreader-inline-stroke:#e9e3d5;"></polygon>
</g>
<!-- c -->
<g id="node3" class="node">
<title>c</title>
<ellipse fill="none" stroke="#000000" cx="54" cy="-18" rx="27" ry="18" data-darkreader-inline-fill="" data-darkreader-inline-stroke="" style="--darkreader-inline-fill:none; --darkreader-inline-stroke:#e9e3d5;"></ellipse>
<text text-anchor="middle" x="54" y="-13.8" font-family="Times,serif" font-size="14.00" fill="#000000" data-darkreader-inline-fill="" style="--darkreader-inline-fill:#e9e3d5;">c</text>
</g>
<!-- a&#45;&gt;c -->
<g id="edge3" class="edge">
<title>a-&gt;c</title>
<path fill="none" stroke="#000000" d="M57.7474,-144.0931C59.7466,-133.6241 61.9966,-120.1241 63,-108 64.3197,-92.0545 64.3197,-87.9455 63,-72 62.2945,-63.4753 60.9727,-54.2703 59.5551,-45.917" data-darkreader-inline-fill="" data-darkreader-inline-stroke="" style="--darkreader-inline-fill:none; --darkreader-inline-stroke:#e9e3d5;"></path>
<polygon fill="#000000" stroke="#000000" points="62.9689,-45.1258 57.7474,-35.9069 56.0803,-46.3698 62.9689,-45.1258" data-darkreader-inline-fill="" data-darkreader-inline-stroke="" style="--darkreader-inline-fill:#e9e3d5; --darkreader-inline-stroke:#e9e3d5;"></polygon>
</g>
<!-- b&#45;&gt;c -->
<g id="edge2" class="edge">
<title>b-&gt;c</title>
<path fill="none" stroke="#000000" d="M33.6742,-72.2022C36.7476,-64.0064 40.4616,-54.1024 43.8695,-45.0145" data-darkreader-inline-fill="" data-darkreader-inline-stroke="" style="--darkreader-inline-fill:none; --darkreader-inline-stroke:#e9e3d5;"></path>
<polygon fill="#000000" stroke="#000000" points="47.1685,-46.1853 47.4026,-35.593 40.6142,-43.7274 47.1685,-46.1853" data-darkreader-inline-fill="" data-darkreader-inline-stroke="" style="--darkreader-inline-fill:#e9e3d5; --darkreader-inline-stroke:#e9e3d5;"></polygon>
</g>
</g>
</svg>

## Alternatives

If you want a broader range of drawing options, checkout [gatsby-remark-draw](https://www.npmjs.com/package/gatsby-remark-draw). It provides SvgBobRus, Graphviz, and Mermaid, but note that you must have these already installed on your system

If you're simply looking for a normal (not Gatsby) remark plugin for graphviz, see [remark-graphviz](https://www.npmjs.com/package/remark-graphviz) which inspired this plugin.


