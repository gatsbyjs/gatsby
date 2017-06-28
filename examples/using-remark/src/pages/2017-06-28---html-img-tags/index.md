---
title: "Responsive Images and iFrames"
date: "2017-06-28"
draft: false
author: Chiedo
tags:
  - remark
  - Images
---

![](mikael-cho-214358.jpg)
*Photo by [Mikael Cho](https://unsplash.com/@mikael) via [Unsplash](https://unsplash.com/@mikael?photo=_3TDkAttcaM)*

[gatsby-remark-build-images][1] and [gatsby-remark-copy-linked-files][2] now support `<img/>` tags.

## How did it work before?

Previously you were limited to using the markdown image format as follows:

```
![](image.png)
```

But the following html syntax would not work:

```
<img src='image.png' />
```

## How does it work now?

Now you can use either the markdown syntax or html syntax for images. This will ensure that any html-syntax image tags in your markdown also get processed and end up in your build.

Enjoy!

[1]: https://www.gatsbyjs.org/docs/packages/gatsby-remark-build-images/
[2]: https://www.gatsbyjs.org/docs/packages/gatsby-remark-copy-linked-files