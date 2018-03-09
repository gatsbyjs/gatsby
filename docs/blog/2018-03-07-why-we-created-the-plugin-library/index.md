---
title: Why we created the Gatsby plugin library
date: 03-07-2018
author: Shannon Soper
---

## Why build a plugin / package library

From October 2017 to February 2018, we conducted over 60 interviews with Gatsby users, and plugin discoverability appeared as a top pain point (see [blog post on the Gatsby UX research program](/2017-12-20-introducing-the-gatsby-ux-research-program/) for a full list of pain points). We built a [Plugin Library](/packages/) and a [Plugin Authoring](/docs/plugin-authoring.md) doc!

This article will walk through our thought processes as we designed and developed this plugin library. We'd love your help contributing as the library continues to improve!


## Jobs to be done

After compiling data from the interviews, we compiled what’s called an “empathy map” in UX design to put ourselves in the shoes of Gatsby users; basically, this map describes a summary of what the typical Gatsby user experiences when searching for plugins.

![Empathy map](empathy-map.png)

To summarize the pain points, most Gatsby fans need to use plugins and it takes them a lot of browsing the plugin list and searching example sites to figure out what plugins they need and want. They also frequently mention how difficult it was to build their own plugin with no tutorials available, and by having more plugins easily searchable at their fingertips, they will be able to find and imitate plugins more quickly.

People generally want to:
1. Find the best, most recent, and relevant plugin, package, or component for their site.
2. Learn how to build a plugin.
3. Preview plugins functionality before installation.
4. Share plugins they build and/or recommend.


## Learning from other plugin libraries

We also analyzed over 10 admirable and/or popular plugin libraries to draw from their strengths and learn from their weaknesses. Examples in no particular order include:
* [JS.coach](https://js.coach/)
* [VIM Awesome](https://vimawesome.com/)
* [Best of JS](https://bestof.js.org/)
* [Sketch extension library](https://sketchapp.com/extensions/)
* [Chrome plugin library](https://chrome.google.com/webstore/detail/plugins/mmcblfncjaclajmegihojiekebofjcen?hl=en)
* [Microsoft Visual Studio Code Extensions](https://marketplace.visualstudio.com/VSCode)
* [Wordpress Plugins](https://wordpress.org/plugins/)
* [Npms.io](https://npms.io/)
* [Yarnpkg.com](https://yarnpkg.com/en/packages)
* [Apple App store](https://www.apple.com/ios/app-store/), which just got redesigned, so I’m interested to learn from their changes
* [Google Play store](https://play.google.com/store/apps/top).

Many of the above plugin libaries have strengths we wanted to imitate:
* an easy way to view many plugins without much clicking necessary
* categories and tags to help refine searches
* important statistics that help people choose plugins based on certain metrics
* a guide for people creating their own plugin

They also have some weaknesses we wanted to avoid:
* poor contrast and poor information heirarchy in visual design
* no filters available
* too many filters available
* image heavy without important statistics for each plugin


## Prototypes and their evolutions

Here’s a sampling of screenshots that many community members contributed to and gave feedback about. It’s rewarding to see how much the design has progressed (and will keep progressing).

<video controls="controls" autoplay="true" loop="true">
  <source type="video/mp4" src="/images/gatsby-plugin-library-compressed.mp4"></source>
  <p>Your browser does not support the video element.</p>
</video>

## Next steps for the plugin library

The plugin ecosystem is a huge part of what makes Gatsby awesome because plugins and packages make Gatsby extensible. There's a virtuous cycle where people find plugins, use them, contribute to them, and create new ones. We hope to accelerate this cycle, so the Gatsby ecosystem can develop faster and more people can build awesome sites! 

Here are some ways you can help make the Gatsby plugin ecoystem great:

* Share feedback on the plugin library on [Github Issue #4394](https://github.com/gatsbyjs/gatsby/issues/4394).
* If you created a plugin and it's not showing up in the library, double check that the package has "gatsby-plugin" in its keywords.
* Create plugins (or publish ones you've already built! If you're interested, the [Plugin Authoring](/docs/plugin-authoring/) page can help.
* [Contact me](https://twitter.com/shannonb_ux/status/938551014956732418) here if you have feedback that differs from or provides deeper insight into one of the pain points this article mentions. 
* Follow us on [Twitter](https://twitter.com/gatsbyjs).


## Sneak peak into the next UX project

For our next step, we're designing a [Gatsby site showcase](https://github.com/gatsbyjs/gatsby/issues/4394) and UX research is driving the design process. Again, many thanks to all the community members who have contributed to this research and to making Gatsby awesome. Stay tuned for updates on the plugin library and future Gatsby UX research projects!