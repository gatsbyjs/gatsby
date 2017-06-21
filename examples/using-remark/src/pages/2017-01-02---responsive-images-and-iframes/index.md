---
title: "Responsive Images and iFrames"
date: "2017-01-02"
draft: false
author: Jay Gatsby
tags:
  - remark
  - Images
  - Videos
  - iFrames
---

![](mikael-cho-214358.jpg)
*Photo by [Mikael Cho](https://unsplash.com/@mikael) via [Unsplash](https://unsplash.com/@mikael?photo=_3TDkAttcaM)*

[gatsby-remark-responsive-image][1] and [gatsby-remark-responsive-iframe][2]
are here to take care of all your basic Markdown image and embed issues.

Let's see some more photos ([I](https://unsplash.com/photos/T7Lnl3PFISM), [II](https://unsplash.com/@maxboettinger?photo=SUFS6CPjB5Q)) by [Max Boettinger](https://unsplash.com/@maxboettinger):

![](max-boettinger-109436.jpg)

![](max-boettinger-288448.jpg)

Okay, nice!

## JPEG and PNG vs SVG and GIF

**@todo Sharp does not process SVG and GIF**  
An animated GIF of the Select2 Logo: ![Select2 Logo animation](select2-logo.gif)

An inline ![example](squiggly.svg) example SVG. Tremendous!

And here's an awesome SVG tiger by [author](http://example.com/)

![awesome tiger](awesome_tiger.svg)

## iFrames and video embeds

Let's add a YouTube video to show off responsive iFrames real quick:

<iframe width="560" height="315" src="https://www.youtube.com/embed/ftYJQSwbbEo" frameborder="0" allowfullscreen></iframe>

Yay, nice!

[1]: https://www.gatsbyjs.org/docs/packages/gatsby-remark-responsive-image/
[2]: https://www.gatsbyjs.org/docs/packages/gatsby-remark-responsive-iframe/
