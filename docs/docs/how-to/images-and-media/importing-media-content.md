---
title: Importing Media Content
---

"Media content" is a broad term that generally includes images, videos, documents and files that are displayed on your website. For Gatsby sites, you have multiple options for importing media content depending on the type:

## Images, SVG, and PDFs

- [Image graphics can be imported](/docs/how-to/images-and-media/importing-assets-into-files/) with webpack and queried with GraphQL.
- Images can also be [included from the `static folder`](/docs/how-to/images-and-media/static-folder/).
- SVG content can be embedded into JSX. Here's a [handy JSX converter](https://transform.tools/svg-to-jsx).
- SVG can be included in `img` tags or CSS backgrounds. [SVG Tips from CSS Tricks](https://css-tricks.com/using-svg/).
- For PDF files, we recommend embedding an [image of the PDF](https://helpx.adobe.com/acrobat/using/exporting-pdfs-file-formats.html) with [alternative text](https://a11y-101.com/development/infographics), and providing a link to download a [tagged PDF](https://helpx.adobe.com/acrobat/using/creating-accessible-pdfs.html).

## Video assets

Like images, video assets present many options and requirements for cross-browser support. Learn about video embeds on the Gatsby docs page on [working with video](/docs/how-to/images-and-media/working-with-video/) section.

## Canvas and WebGL

The HTML5 `<canvas>` element provides a space for 2-dimensional drawing in a web environment. In Gatsby and React, it may help to include a library like [react-konva](https://github.com/konvajs/react-konva) or one of the comparison libraries to cut down on boilerplate and make drawing easier.

[WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Getting_started_with_WebGL), on the other hand, creates a 3-dimensional space in a web environment using the `<canvas>` element. Libraries like [Three.js](https://threejs.org/) are often used to enable WebGL experiences in React apps.

> Using canvas and/or WebGL may require modifying your webpack config. Do you have experience with making this work in your Gatsby site? Contribute to the docs by adding more details to this page.
