---
title: Why I Upgraded My Website to GatsbyJS from Jekyll
date: "2018-02-27"
author: "Jia Hao Goh"
excerpt: My thought process during the long overdue rewrite of this website
---

*This article is the first of a two part series, on the engineering behind my [website](https://jiahao.codes). Originally published [here](https://jiahao.codes/blog/why-i-upgraded-my-website/)*

For the past couple of weeks, I’ve been rebuilding my personal website from scratch, live at [https://jiahao.codes](https://jiahao.codes) with the source code on [GitHub](https://github.com/jiahaog/jiahao.codes). In this article, I'll tell the story of this long overdue rewrite and talk about the new static site framework I eventually settled on, Gatsby.

## Background

For a bit of background, I originally built my website while I was an undergraduate back in 2016. It was a single page [React](https://reactjs.org/) application, with the design based around an interactive search box where visitors could type in things. The application would then change based on what was typed in, to show projects I’ve done, like a website resume or portfolio. I tagged it on Git for posterity [here](https://github.com/jiahaog/jiahao.codes/releases/tag/1.0.0).

Some drawbacks were that the content was very coupled with the code to to style the page, and it was difficult to change the theme without having to rewrite a lot of code. It uses a customized version of [JSON Resume](https://jsonresume.org/) to display data, but ultimately I didn't do a good job and it was a bit of a mess.

Furthermore, being a single page application, it takes a little too long to load just to display some static content. I wanted to add routing and different pages to add blogging functionality, which it wasn’t really suitable for without major refactoring.

## First Iteration — Jekyll

This led me to pick something very minimal and lightweight to rebuild it. In my time at [Grab](https://www.grab.com), I worked a little on maintaining our [engineering blog](https://github.com/grab/engineering-blog) which was built on top of [Jekyll](https://jekyllrb.com/). I liked how minimal it was, you just had to pick a theme and drop in your posts in the [markdown](https://daringfireball.net/projects/markdown/) format. There is clear separation of concerns between the content and the site design.

It’s nice that pages, layouts, and categories in Jekyll are just small building blocks that are composed together to build a website, making it easy to reason about how everything fits together. I picked the [Hyde](https://github.com/poole/hyde) theme to start off, and played around a little with the CSS to touch up a few areas.

When delivering content to users on mobile devices, it is important to optimize delivery of images to the users. Users on smaller mobile devices should not need to load large image resources, but instead should load the appropriate image for their viewport. HTML5 specifies the [`srcset`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-srcset) attribute for `<img/>` tags which is ideal for this.

However, it would be a pain to have to manually convert images into different sized thumbnails for a post. I wanted an automated image processing pipeline to automatically resize the images extracted from the markdown documents, and then automatically populate the `srcset` attribute on the images in the output HTML document. I found the [Jekyll Responsive Image Plugin](https://github.com/wildlyinaccurate/jekyll-responsive-image) great for this. It allows me to create templates which will be used by Jekyll when rendering the markdown and automatically does the image resizing.

Even so, when I tried to do more complicated workflows like adding CSS preprocessing with dependence on the JavaScript ecosystem with the [Node Package Manager (npm)](https://www.npmjs.com/), it became a lot more convoluted. Looking at a few recipes I’ve found, I would have to dive down the road of writing [Gulp](https://gulpjs.com/) workflows and somehow connect them to Jekyll commands. I also chanced upon the [Jekyll Asset Pipeline](https://github.com/matthodan/jekyll-asset-pipeline) which seems what I could use. I didn’t dive too deep into it, but from brief glances it seems like I would have to come up with a lot of custom scripting to interface with Javascript libraries on my own.

I guess having used [webpack](https://webpack.js.org/) at work, I was pampered by this open source community where there are loaders and documented recipes for doing almost anything, granted that someone was willing to wade into the world of "Javascript fatigue". Around the same time, [@yangshun](https://github.com/yangshun) introduced me to [Gatsby](https://www.gatsbyjs.org/), a React static site generator which seemed really fascinating. It also seemed a good opportunity for me to get my hands dirty with frontend development again.

As I had some free time on my hands, why not rewrite everything again and keep myself updated with the ever-changing Javascript ecosystem? Seems like a lot of fun!

## Final Form — Gatsby

[Gatsby](https://www.gatsbyjs.org/) is a static site generator that can render sites from markup documents using templates defined as React components. It functions similarly to Jekyll, where you can pick a [starter project](https://github.com/gatsbyjs/gatsby-starter-blog), [drop in](https://github.com/gatsbyjs/gatsby-starter-blog/blob/master/src/pages/hello-world/index.md) some markdown documents for articles, and [be rewarded](https://gatsbyjs.github.io/gatsby-starter-blog/) with a website with minimal effort.

It offers much much more, however. Gatsby lets me leverage all the modern tools for building web applications and to add interactive experiences for visitors like a fully fledged [React](https://reactjs.org/) application. Not only that, it is unlike traditional single page applications, and works *without* JavaScript! Things would certainly be more complicated if I were to add a JavaScript compilation pipeline to a Jekyll site, and a JavaScript framework would be a better fit.

### How It Works

Let me briefly give a high level overview of how Gatsby works from my short experience using it.

Developing the application is the same as developing a React application, with useful things like [hot module replacement](https://webpack.js.org/guides/hot-module-replacement/) to aid easy development already set up by Gatsby. What’s different is that there is a framework in place to use [GraphQL](http://graphql.org/) queries to pull content into the client side browser environment. React components can define a query and the component will be hydrated with the result of the query as props when it is rendered.

For example, I defined a `PostTemplate` which will be used to render pages for articles.

```jsx
// src/templates/Post.jsx

import React from 'react';

export default function PostTemplate({
  data: { markdownRemark: { frontmatter: { title, date }, html } },
}) {
  return (
    <div>
      <h1>{title}</h1>
      <small>{date}</small>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export const pageQuery = graphql`
  query PostByPath($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        title
        date
      }
    }
  }
`;
```

When the `<PostTemplate />` component needs to be rendered into a page, the accompanying exported `pageQuery`, a GraphQL query is made, and the results are passed in as props into the component.

The real magic happens when the website is compiled into a production bundle. Running `gatsby build` will tell Gatsby to perform all the GraphQL queries defined and render all the React components into a HTML document, using a technique known as server-side rendering. This means that everything “React” is serialized and compiled to static HTML, ready to be viewed without Javascript. Visitors to the site will then be able to quickly load and interact with the static version of the page.

Not only that, within the HTML document, there are instructions to load the Javascript bundle of your application asynchronously. When it has been loaded, the content displayed in the browser will be dynamically replaced by the React application, gaining interactivity. This also happens with the other pages of your site — Gatsby will ensure that they are asynchronously loaded so that when you click on a link, the data is already cached on the browser for React to swap out the DOM elements that need to be changed. Everything is done to give the illusion of speed to the viewer while asynchronously loading everything in the background.

### Plugins

Because of the APIs exposed by Gatsby for interfacing with its internals, powerful plugins can be built to extend the core functionality of Gatsby and reducing work by developers.

#### Node.js APIs

- Can be extended with a `gatsby-node.js` file in the root of the project

The [Node.js APIs](https://www.gatsbyjs.org/docs/node-apis/) let plugins extend or modify the heavy lifting performed by the Node.js process when compiling the application. Your gatsby-node.js file can export functions which modify the GraphQL data that is provided to React components when they are rendered. The APIs are also used by plugins to extend the internals of Gatsby e.g. the default webpack config can also be customized here.

Take the example of what happens during the processing of markdown files into pages. The [gatsby-source-filesystem](/packages/gatsby-source-filesystem) plugin scans directories and from files it finds, creates File nodes. These File nodes are then processed by [gatsby-transformer-remark](https://github.com/gatsbyjs/gatsby/tree/a3fea82b4d4b4c644156e841401821933e8d694a/packages/gatsby-transformer-remark) , parsing the markup into HTML with the [Remark](https://remark.js.org/) markdown processor.

#### Server-side Rendering APIs

- Can be extended with a `gatsby-ssr.js` file in the root of the project

The [server side rendering APIs](https://www.gatsbyjs.org/docs/ssr-apis/) allow hooks to be defined to modify the rendering process of the application. For example, the [Typography.js Plugin](/packages/gatsby-plugin-typography) uses this to [inline the styles](https://github.com/gatsbyjs/gatsby/blob/ab1d7f50adcff5b7085e6236973b8c30083aa523/packages/gatsby-plugin-typography/src/gatsby-ssr.js#L11-L14) required into the DOM head when rendering.

#### Browser APIs

- Can be extended with a `gatsby-browser.js` file in the root of the project

Finally, the [browser APIs](https://www.gatsbyjs.org/docs/browser-apis/) allows plugins to run code on lifecycle events while Gatsby is running in the browser. The [Google Analytics Plugin](/packages/gatsby-plugin-google-analytics) [uses these APIs](https://github.com/gatsbyjs/gatsby/blob/a3fea82b4d4b4c644156e841401821933e8d694a/packages/gatsby-plugin-google-analytics/src/gatsby-browser.js#L4-L5) to track the location of the user on route changes.

The best part about using Gatsby is that there plenty of plugins available leveraging these APIs that give us new features almost for free. Want to add offline mode to your application? RSS feeds? Styled components? Just lookup the [available plugins](https://www.gatsbyjs.org/docs/plugins/#official-plugins) and drop them into the [`gatsby-config.js`](https://github.com/jiahaog/jiahao.codes/blob/master/gatsby-config.js)!

## Next Steps

Jump over to my website to read the [follow up post](https://jiahao.codes/blog/integrating-and-building-all-the-things/) where I showcase the amazing integrations and features I have set up, to be on the cutting edge of web development!

Check out the source code for my site on [GitHub](https://github.com/jiahaog/jiahao.codes)!
