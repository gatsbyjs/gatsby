---
title: "Using gatsby-remark-copy-linked-files"
excerpt: "Using gatsby-remark-copy-linked-files."
date: "2017-11-13T10:19:45.267Z"
draft: false
path: "/using-gatsby-remark-copy-linked-files/"
---

Plugin documentation:
[gatsby-remark-copy-linked-files](https://www.gatsbyjs.org/packages/gatsby-remark-copy-linked-files/)--_"Copies
local files linked to/from markdown to your `public` folder."_

HTML small test (see the
[gatsby/#2696](https://github.com/gatsbyjs/gatsby/issues/2696)--_"[gatsby-transformer-remark]
Content of inline HTML tags from markdown source is outside of tags in HTML
output."_):

<small class="caption">_This is a `<small>` HTML tag with some Markdown
formatting and inline code and CSS class of `caption`. Styles for the latter are
defined in `utils/typography.js`._</small>

## Images

A Markdown image tag:

![Markdown image tag](./alex-holyoake-388536.jpg)

The HTML equivalent, with some inline `style`:

<img src="./alex-holyoake-388536.jpg" alt="HTML image tag" style="float:none;height: auto;width: auto">

<small class="caption">_Two HTML image tags with inline styles in two Markdown
paragraphs, image width set to `160px` and `280px` via inline `style`:_</small>

<img src="./alex-holyoake- 388538.jpg" style="width: 280px; float: left; margin: 0 1.8rem 1.8rem 0;">
We interrupt this program to annoy you and make things generally irritating. I
cut down trees, I skip and jump, I like to press wildflowers, image #1 should be
floating `left`.

Hegel is arguing that the reality is merely an a priori adjunct of
non-naturalistic ethics, Kant via the categorical imperative is holding that
ontologically it exists only in the imagination, and Marx claims it was offside.

### Markdown Headline `<h3>`

<img src="./alex-holyoake-327106.jpg" style="width: 160px; float: right; margin: 0 0 1.8rem 1.8rem;">
And whereas in most professions these would be considerable drawbacks, in
chartered accountancy, they're a positive boon. Image #2 should be floating
`right`. We're not cheap--here's a HTML href
<a href="http://example.com/">example.com</a> on top!

**Paragraph tags with Markdown content** with two HTML images inline, running
across multiple lines: ![inline image](./alex-holyoake-340782.jpg)

<p>
  HTML Paragraph with two inline images:
  <img src="./jakob-owens-262566.jpg">
  and another one: <img src="./alex-holyoake-327106.jpg">
</p>

## Links

A HTML href on a single line:

<a href="Creativecommons-informational-flyer_eng.pdf">Download PDF</a>

HTML paragraph with text and HTML href inside:

<p>Lorem ipsum <a href="Creativecommons-informational-flyer_eng.pdf">Download PDF</a></p>

A HTML href on three lines – opening tag, inline text, closing tag:

<a href="Creativecommons-informational-flyer_eng.pdf">
  Download PDF
</a>

Paragraph in regular Markdown and HTML href:
<a href="Creativecommons-informational-flyer_eng.pdf">Download PDF</a>

Paragraph in regular Markdown and Markdown href:
[Download PDF](Creativecommons-informational-flyer_eng.pdf)

## Fails & Wins

<small class="caption">_<span class="win">Wins</span> are easily recognizable by
either an image or a video being displayed--<span class="fail">Fails</span> are
marked._</small>

### Markdown Images containing a space

<!-- if the image name contains a space, markdown images wont be copied -->

Here's a <span class="fail">Markdown image with space in filename</span>:

![](./alex-holyoake- 388538.jpg)

But: <span class="win">HTML image</span> with space in filename:

<img src="./alex-holyoake- 388538.jpg">

### Embedding Video

HTML video tag with `source` and a fallback paragraph,
<span class="win">multiple lines</span>:

<video controls="controls" autoplay="true" loop="true">
  <source type="video/mp4" src="gatsbygram.mp4"></source>
  <p>Your browser does not support the video element.</p>
</video>

However doing the same in just one line of HTML fails--\
Video, <span class="fail">single line</span>:

<video controls="controls" autoplay="true" loop="true"><source type="video/mp4" src="gatsbygram.mp4"></source><p>Your browser does not support the video element.</p></video>

### Embedding Audio

HTML audio tag with `source` and a fallback paragraph (MP3 via [doria.fi](https://www.doria.fi/handle/10024/72376), public domain):

<audio controls="controls">
  <source type="audio/mp3" src="RAI-GramophoneGC-82979-01-1-001.mp3"></source>
  <p>Your browser does not support the audio element.</p>
</audio>

## gatsby-config.js

```javascript
{
  resolve: `gatsby-transformer-remark`,
  options: {
    plugins: [
      {
        resolve: `gatsby-remark-responsive-iframe`,
        options: {
          wrapperStyle: `margin-bottom: 1.0725rem`,
        },
      },
      'gatsby-remark-prismjs',
      {
        resolve: 'gatsby-remark-copy-linked-files',
        options: {
          // `ignoreFileExtensions` defaults to [`png`, `jpg`, `jpeg`, `bmp`, `tiff`]
          // as we assume you'll use gatsby-remark-images to handle
          // images in markdown as it automatically creates responsive
          // versions of images.
          //
          // If you'd like to not use gatsby-remark-images and just copy your
          // original images to the public directory, set
          // `ignoreFileExtensions` to an empty array.
          ignoreFileExtensions: [],
        },
      },
      'gatsby-remark-smartypants',
    ],
  },
},
```
