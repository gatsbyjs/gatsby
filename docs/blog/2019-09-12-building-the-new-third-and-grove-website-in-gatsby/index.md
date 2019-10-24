---
title: Building The New Third And Grove Website In Gatsby
date: 2019-09-12
author: Grant Glidewell
excerpt: "How we built our new website with a modern front end for Drupal using Gatsby"
tags:
  - case-studies
  - agencies
    - building-websites-faster
    - drupal
canonicalLink: https://www.thirdandgrove.com/building-new-site-with-drupal-and-gatsby/
---

This rebrand/replatform is a big leap forward for our brand, marking a milestone in who we want to be as a company. In this article, I’m going to focus on the tech behind the screen that makes it all happen.

## Why use a modern front end?

We’re a Drupal agency through and through. But since we saw the promise of front end tech like React, we’ve better equipped our team with people who can build modern digital experiences for our clients (including people like me!) Building our own site with a modern front end is foremost a way for us to eat our own dog food (good news is that we’re still really enjoying eating it).

There are several reasons to modernize from an aging front end but these stick out to us.

1. **User Experience.** It’s possible to create an amazing user experience with dated technology (we’ve done it many a time). BUT it’s easier, cheaper, and faster to do with a modern set of solutions.
2. **Developer Velocity.** Leveraging Gatsby has improved the code quality and tooling. So development, while faster, can produce code that is more testable, has less duplication and is of higher quality. It also reduces the overhead for developers to know HTML, CSS, JavaScript, and PHP. This last part wasn’t of huge importance to us but for this can make a world of difference to our clients that don’t have as wide a skillset on their team.

It’s worth pausing to talk about UX and velocity. The more we work with our clients, the more we realize those two aspects are key for successful projects. Customer expectations and trends are constantly changing so we have to be adaptable and continually iterative in order to engage with our customers. Developers don’t have to be a bottleneck when the tech naturally supports speed AND beautiful experiences.

## Going decoupled with Drupal + Gatsby

There are a lot of options available to build headlessly against Drupal. Angular, React, Vue, all viable options. Each has its strengths and would create an end result that we could be proud of.

I, being a React developer, advocate for the use of a non-opinionated library. But there were concerns about SEO and load speeds. Those concerns can be mitigated a few different ways, but one way that abstracts that complexity is to use a static site generator. But we don't want a static site, we want the option of building everything in React and maintaining the excellent client experience a React application can provide. Enter Gatsby.

We chose Gatsby because it’s the best we’ve seen at doing what it does. We can develop in React; we get the load speed of a static page and the benefits of using React on the page; and an excellent development experience along the way. I’ll share some of the good parts along with pain points and the solutions we came up with.

## What we love about Third And Grove v5 (TAGV5)

We love how our new brand is portrayed on the site but we’ll focus on the benefits of the technologies we used.

**Performance.** One of the great Gatsby claims is performance. Out of the gate their starter has incredible scores in [Chrome Lighthouse](https://developers.google.com/web/tools/lighthouse/). Our worst performance metric is in image load times, like many other sites across the web. Manually going through and processing images, or even doing automated batch processes is a pain and can sometimes become a rabbit hole. Their ‘gatsby-image’ plugin does some awesome pre-processing, resizing, and even lazy loading so you can maintain these great load times. So maintaining that high-performance score is not a chore, but a joy.

**Preview ❤️. **Our site is the first in the world to use [Drupal with Gatsby Preview](/blog/2019-06-26-live-preview-for-drupal/) in production (mainly because we built Drupal + Gatsby preview). This allows content editors to see an actual rendering of the content they are working on. Not an approximation, a fully rendered React app with their content as they are editing it. It's in the early stages but Third and Grove developed both the Drupal module and Gatsby source plugin modifications to make this possible for anyone to do.

We feel like this allows content editors to keep using tools they are comfortable with. It also opens up opportunities to implement workflows that were harder to set up previously. One might be having the Gatsby Preview instance as a staging environment, so content is previewed there and approved before pushing to a live site. We’re excited to explore different options this allows and hope to get community feedback on how others are using this great new tooling.

## Pain points that we came across (and solved)

We’re going to get technical here because the main pain points were around custom modifications to get exactly what we wanted.

**Styling.** One of the more contentious issues in the JavaScript community is styling. CSS in JS, just that term, stirs up some mighty opinions. While this won’t address the rift, we are firmly on the side of ‘css in js is dope’. Using Emotion in our Gatsby project has been amazing. It has allowed us to maintain a very clean project structure, without sacrificing any of the flexibility of using Sass. We could have easily used Sass in this project as Gatsby has support for it. Instead of having matching co-located style files, we write local styles directly in the component where they are scoped. If you're unfamiliar with scoping styles, it allows you to write styles with no fear of them leaking to an unintended target somewhere else in the DOM.

**Build Times.** One of the pain points in Gatsby can be build times. We initially built against our existing instance of Drupal. However, the Drupal source plugin for Gatsby pulls in all the data in JSON API by default. So our build times were … not fast. We had a decision to make: spend time limiting what is exposed in Drupal’s JSON API, write queries with filters and includes (which the source plugin allows for), or opt for an entirely new Drupal build. We took this third path, which immediately allowed us to control our build times without getting into writing delicate queries and blocking certain content from the API. The new Drupal instance is built to be decoupled first, which is important. Next, we built content types that were specifically made to be ingested by Gatsby, allowing for more dynamic content creation. This works by matching content types in Drupal to React components. It allows for some really nice content workflows, but those are in the works and not in the scope of this post.

**Dynamic Content Creation.** This is an interesting topic in Gatsby. Their project structure has a ‘pages’ directory where all of your static routes live. So if I want a page at `www.mysite.com/about`, I can create a `about.js` file in that folder and the route exists and renders that component. In most React projects, routing is a bit more involved than this. So this skips quite a bit of boilerplate code. However, it creates an issue. React is declarative. And I like to follow that in my project structure as well. With this pattern, I have no place to see my site structure. It's a tradeoff. In that same vein, programmatic page creation happens in a bit of an obfuscated way. You generate these routes using a template component and the ‘gatsby-node.js’ file with some exposed APIs for page generation Gatsby gives you. This isn't a big problem, but hides some of what is nice about React projects that have routes: these routes render components, and the components clearly render blog posts based on said route.

In our new site, we have content coming from multiple sources. Each source might render pages to multiple templates: keeping this process clean and clear is not easy. We've opted for small queries in the ‘gatsby-node’ file, passing an ID to the template, which uses that ID to make a more detailed query (an exported page query). This pattern feels better than a ‘gatsby-node’ file with huge queries that are unrelated to the task at hand and allows us to have templates co-located with the expected data shape. Using this pattern also allows us to support live updated through Gatsby Preview.

## More like TAGV5.1

The beauty of building React projects is that they are highly flexible. This flexibility allows us to construct this front end in a way that it can grow with us. So instead of having to rebuild everything when we want a new look, we can change some of our wrapper components out, or add a new data source if we start a swag store. This gives us a layer of abstraction that is useful in the real world. Our data/content is separate from our views, and our views are abstracted from their structure. This is powerful for many reasons, foremost being that, instead of building a single entity that is our site, we are building modular pieces that when combined become an awesome thing, like a Megazord, or Captain Planet. This mentality of modular code isn't new and isn't unique to React. However, the JavaScript ecosystem and React in particular have taken this approach to heart. Gatsby takes it a step further with their plugin model. For example, adding a sitemap is as easy as adding a plugin. Once the plugin is installed it’s just another task added into the Gatsby build process using information that is already available.

With this modular approach, we can add, refactor, and redesign at will. The TAG website is now a living breathing internet creature more than ever before. Now on to TAGV5.2.
