---
title: "Rendering math equations with KaTeX"
date: "2017-08-07"
draft: false
author: Daisy Buchanan
tags:
  - remark
  - math
  - KaTeX
---

[gatsby-remark-katex][1] adds math equation support to gatsby using
[remark-math][2] and [katex][3].

## Math Equations in Inline Mode

Surround your equation with `$` to generate a math equation in inline mode.

**Example markdown:**

```
$a^2 + b^2 = c^2$
```

**Example output:** $a^2 + b^2 = c^2$

## Math Equations in Display Mode

Surround your equation with `$$` and new-lines to generate a math equation in
display mode.

**Example markdown:**

```
$$
a^2 + b^2 = c^2
$$
```

**Example output:**
$$
a^2 + b^2 = c^2
$$

**Add Katex CSS to your template** Katex's CSS file is required to render the
formulas correctly. Include the CSS file in your template ([example][4])

```
require(`katex/dist/katex.min.css`)
```

[1]: https://www.gatsbyjs.org/packages/gatsby-remark-katex/
[2]: https://github.com/Rokt33r/remark-math
[3]: https://github.com/Khan/KaTeX
[4]: https://github.com/gatsbyjs/gatsby/blob/master/examples/using-remark/src/templates/template-blog-post.js
