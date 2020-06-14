---
title: It’s Gatsby’s 5th Birthday 🎂 (and everyone’s invited!)
date: 2020-05-22
author: Kyle Mathews
excerpt: “Five years ago today, a nascent Gatsby emerged in the form of Issue 1 on the brand new Gatsbyjs GitHub repo. Here are some thoughts about where we began and how Gatsby has evolved during this most interesting demi-decade.”
tags:
  - community
  - gatsby-cloud
  - plugins
---

The web is an incredible place. I’m so happy I get to help build it. I’ve been building websites and web apps for a long time now, and I spent a lot of that time thinking about and experimenting with what a perfect toolset for building for the web would look like. Five years ago those thoughts coalesced into the unveiling of a nascent framework I had decided to call Gatsby:

> There's a lot of static site generators out there and I've played with several and written my own for my blog. They're all pretty much the same and not particularly interesting. I think a React based SSG can push the state of the art in three ways — easy no-page transitions, React style components, and leveraging the growing React ecosystem of tools and components.
> Most stuff on the web are sites, not apps. And React components are just as powerful for sites as they are for apps so a kickass tool for building React sites would be very valuable.

-- Opened as Issue #1, “Braindump of ideas,” by @KyleAMathews on the brand new Gatsbyjs/Gatsby GitHub repo, May 22, 2015.

Now it’s May 22, 2020. Five years (and 9,820 closed issues) later, it is interesting to pause for a beat to look back at where we started. Where is Gatsby now? What has actually come into existence, from that original brain dump vision, and what fell away?

## Project name: Codex

One of the original tenets of the Gatsby codex (“Codex” was actually my code name for the project when I first started pulling it together) came from Facebook engineering's "pit of success" slogan: Incredibly fast websites should be the default state, not some monumental engineering feat. So one of the foundational philosophies behind building Gatsby was, anything that prevents Gatsby from generating the fastest possible website is a bug. That understanding guided a lot of decisions along the way, like incorporating GraphQL (thanks again, Facebook!) to allow client code to specify data requirements. So that every page can specify exactly the data it needs so that -- and only that -- data gets loaded with each page. That was a key moment.

Speaking of codex, here are original notes and sketches from February 2015, a notebook where I was noodling on the tool that was to become Gatsbyjs, titled “Codex/transforming data into websites.” These notes included a list of “things it should be able to do, in no particular order.”

![Notebook pages with written ideas for Gatsby](https://lh3.googleusercontent.com/1-cuk_N6BGpiSfkyasxdrAJz5kvyfJlKiMuRSyVSMialYlUfDgMktC4bWN0FxabBJ6UQjD3-VLO3Mak4jx2TKm8STra23TV6A5M2GBuB7XSa43XKgYmE44bEfustAmNtFzd2yOQS)

So I set out to create a framework that would be:

- Configuration/Convention driven but easily overridable with code.
- No reload page transitions. The initial HTML page would load followed quickly by a JS bundle with the content for the rest of the site.
- Smart code splitting
- Themes that are installable separately
- Support for Markdown/Asciidoctor/other text formats
- Plugins support
- Hot reloading built in
- A Docker image that autobuilds/server site.
- RSS/Atom support - necessary for anything blog-like

Some of these things, ok lots of these things, are well known and appreciated parts of Gatsby’s current v2: code splitting, Themes. Others are maybe less well known and appreciated, though we did build them. ([Gatsby Docker images](https://github.com/gatsbyjs/gatsby-docker) comes to mind).

## Contemplating composable websites

A couple months after that Issue #1 braindump I was messing around with an issue in the `reduxjs/redux` repo -- discussing the possibility of using a static site generator to spin up a site to host Redux documentation on GitHub Pages. The conversation led to another turning point moment in Gatsby’s evolution:

> Woah. Just had an idea. What do you think about the idea of "composable" websites? Gatsby is already doing this to some extent as it has fallbacks for most critical files you need, though you can override them easily. But we could extend that concept further to something like Object.assign(Gatsby, website_base, actual_website).

> So in practice how this would work is there'd be a base documentation site hosted on GitHub. When you want a new docs site you'd just set the GitHub url for the base site and then start adding Markdown files. Anything else you'd want to modify could be set in the site config file.

This idea of “composable” websites eventually resulted in Gatsby Themes, plugins that include a `gatsby-config.js` file and add pre-configured functionality, data sourcing, and/or UI code to Gatsby sites. Essentially, modules that can be put together to form a single, holistic Gatsby site. Which in turn led to Gatsby Recipes as a way to address the challenge of translating an idea -- “I want to do x” -- to how “x” is done in Gatsby. Recipes help users take the literally thousands of plugins and themes that the Gatsby open source ecosystem now offers, and apply them to accomplishing desired tasks in the CLI while also enabling them to automate the process.

Gatsby is a great tool for so very many diverse and creative projects and it has been a genuine thrill over the past five years to see what's been built with it. And how many people have been busy building: as of now, our repo shows there are 200k public Gatsby sites on GitHub. 200k / ( 365 days \* 5 years old) = 110 sites a day 🎉!

![Screen shot of user count on Gatsby GitHub repository](https://lh6.googleusercontent.com/m_BAZRYXtxDgy4f4oxrtxMgtbGnIxlCpfXJUHS6oCoE_c1kTOslsjJFvJ1wKWkYjvWkwbIJuNBnNng78Z5je9se6KDleT5YEatR7N-0-NTB-VFLvfu3s-4CN7RTcIRMVZ6GOM55P)

## Many hands

There are so many other amazing and cool things that have happened in the first five years of Gatsby that there is no possible way to talk about them all. But one thing is true about every single one of all of these things. None of this would have happened without the incredible community that has come together around Gatsby.

Gatsby’s source code has lived on GitHub since Day Zero. The Gatsby community is composed of the tens of thousands of developers building websites on Gatsby, and the 3300+ contributors that have helped write code, write docs, write blog posts…All. The. Writing, particularly apt for a project named after one of the greatest works of literature. It’s exactly zero exaggeration to say Gatsby would not be the incredibly flexible tool for creating for the web it has grown to become without the rich ecosystem surrounding it.

So it seems especially fitting that Gatsby’s fifth birthday is marked by another milestone: a couple days ago, we crossed 2,000 plugins -- created and contributed to by those same amazing community members 🎉.
 ![Gatsby plugin library home page showing 2000 plugins](https://lh6.googleusercontent.com/KqOZPwfYA989MOvcpi93cDXCcIwDt_T4PEkbIIIxEzNzVhJpd8VayWjTPQlxS56oFjmhqVWcij6z3UDSbbTQ_i-Z1V3ak9BaMD4S4ZfYi70ZKbCFJKeRn6pgiSQHYCSBp25IWUPH)

## Community in the Cloud

This has gone on so much longer than I expected a quick “happy birthday to Gatsby” post would be. And we still haven’t talked about Gatsby Cloud, the specialized infrastructure we built to do incremental, parallelized builds to take full advantage of the stream processing architecture at the heart of the Gatsby framework. In just the past few months we have released some amazing new features. The most recent, Incremental Builds, truly creates a new event horizon for what static websites are capable of, by busting open build times for data and content changes on even huge and/or image-intensive sites.

It’s truly exciting to look back to see how far we have come in the last five years, and then to look ahead and think about what might be possible in the next five. Lots of things will change and evolve, because that is how growth happens. But one star that will remain fixed in the Gatsby firmament is commitment to open source. We believe in giving back, because Gatsby wouldn’t be a success without all the work of our community and contributors, not to mention all the other open source projects and technologies we rely on. We're all connected. We're all dependent on each other, and so we want to be strong contributors to the ecosystem. And we are equally committed to making sure Gatsby Cloud is community accessible, too; there will always be a robust free tier for individuals and projects.

So no matter what happens over the next five years, there are things that will not alter. Gatsby the open source framework is always going to be open source. Always going to be free, always going to be supported, and always with the community as co-pilot.

_Ready to dive in for even more Gatsby goodness? Join us at our first-ever Virtual Gatsby Days, two half days of speakers, demos, and All Things Gatsby coming up on June 2 & 3rd. Register now: https://www.gatsbyjs.com/virtual-gatsby-days-registration/_
