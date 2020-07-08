---
title: "Gatsby Days Reconfigured"
date: 2020-06-23
author: Dustin Schau
excerpt: With all the momentous events of recent weeks, we decided -- after a lot of discussion and thought -- to reconfigure this month’s planned Gatsby Days. Now is not the right time to take attention and space away from the Black Lives Matter movement. Transforming Gatsby Days from a live event into a video and blog content series allows us to share all the amazing speakers and learning opportunities of the live event in a way that the community can access as the time is right for each of us. Today’s post is the first in the series, presenting all the product and program announcements that we had planned for the original online event.
tags:
  - announcements
  - gatsby-days
  - community
---

Events over this past month have been truly momentous. While many of us struggle to recognize and address the damage caused by systemic racial injustice and oppression in the US, at Gatsby we are doing our best to meaningfully support the Black Lives Matter movement. This is why we made the decision to reconfigure Gatsby Days from the live online event that was originally planned.

We feel now is simply not the time to take attention and space away from the Black Lives Matter movement. Transforming Gatsby Days from an event into a video and blog content series allows us to share all the amazing speakers and learning opportunities of the live event in a way that the community can access as the time is right for each of us.

Today’s blog post is going to be a long one, because this is where we are sharing the new programs and products we had planned to announce at this week’s Gatsby Days. We are following up with individual posts featuring recorded presentations from the Gatsby community members who were scheduled to speak. We are sorry to miss gathering, even virtually, and we thank everyone for understanding -- and supporting -- the change. Until we can meet again, please enjoy the recorded presentations and demos from Gatsby Days Reconfigured.

**[New from Gatsby](#new-from-gatsby)**

- [Gatsby Partner Program](#gatsby-partner-program)
- [Gatsby Admin](#gatsby-admin)
- [First-class Drupal Integration](#first-class-drupal-integration)

**[Coming soon](#coming-soon)**

- [Gatsby Blog Theme v2](#gatsby-blog-theme-v2)
- [The Path to Instant Builds](#the-path-to-instant-builds)
- [Unified Routes](#unified-routes)
- [Gatsby Ambassador Program](#gatsby-ambassador-program)
- [i18n Theme](#i18n-theme)
- [New WordPress Source Plugin](#new-wordpress-source-plugin)

**[Behind the Scenes](#behind-the-scenes)**

- [Tasty Bits of Design Research](#tasty-bits-of-design-research)
- [Making Gatsby Faster](#making-gatsby-faster)

## New from Gatsby

### Gatsby Partner Program

**Linda Watkins, VP of Partnerships at Gatsby**

First up, we are excited to [formally announce the Gatsby Partner Program](/blog/2020-06-22-Announcing-Gatsby-Partner-Program/) this week. It's important to Gatsby that we support agencies in their work with clients in the most robust and effective ways possible. Equally important is supporting everyone building the overall ecosystem of CMS, infrastructure tools, and other technologies that are foundations of the modern web. We designed the Gatsby Partner Program to further extend this support and provide new avenues for collaboration and engagement between Gatsby and official Agency Partners and Technology Partners. Listen as Linda Watkins, VP of Partnerships at Gatsby, describes the features and benefits of both kinds of partnerships and then visit our new [Gatsby Partner Program landing page](https://www.gatsbyjs.com/partner) for details on how to join.

https://www.youtube.com/watch?v=iKSLYpFEKZc

### Gatsby Admin

**Max Stoiber, Staff Software Engineer at Gatsby**

Today we are introducing another new addition to the Gatsby ecosystem: Gatsby Admin. Currently in alpha, Admin is a new interface for managing your Gatsby site’s configuration. Admin aims to be the hub for utilizing and managing features like Themes, Blocks, Recipes, and GraphiQL. Admin is a core piece of our ambition to make Gatsby fully accessible for all kinds of users, not just coders. Our vision: everything that’s possible in `gatsby-config.js` should eventually be possible through the Admin. This first alpha release includes plugin and theme management, as well as a theme file shadowing interface. After watching Max introduce and demo Admin in his presentation, you can go sign up for the Admin alpha at [gatsbyjs.com/admin-alpha](https://gatsbyjs.com/admin-alpha).

https://www.youtube.com/watch?v=B7D_B2HTbko

### Demo: Create a Contentful Blog in under 2 minutes with no coding or configuration using Gatsby Recipes for Admin

**Kyle Mathews, Co-founder and CEO of Gatsby**

Let’s take a look at the coming Admin version of Gatsby Recipes and how we can create a brand new blog from scratch in less than two minutes with no coding required. We are using the Contentful Blog Recipe for, you guessed it, setting up our new blog on Contentful. Ready? First step: The Recipe informs you of the changes it will make to your site on your behalf, installing the necessary NPM packages and plugins, like `gatsby-source-contentful`, to pull data from your new Contentful space, which it also nicely and automatically creates for you. The first, and really only, thing you need to do is enter some information, like what you want to name your blog, plus the title and some content for your first post. (It’s ok for these to be placeholders for now, you can edit them easily once the blog is set up on Contentful). You enter these into text boxes, which behind the scenes is setting up the new Contentful space and specifying the `BlogPost`content type. Gatsby uses source plugins to automatically and very efficiently power your site with data from different sources, and using Admin means zero configuration work from the user is required.

Second, hit the “install Recipe” button. A few seconds to install the plugins and create the spaces, and there you go! Head over to Contentful and you will find the blog space that we just created. Click on the “Content model” tab and there’s your brand new blog and your first example blog post. Click on that to start writing/editing (Hello, World!) and view your brand new site. Yes, this took less than two minutes. Yes, it’s that easy.

https://www.youtube.com/watch?v=0ZrhTTxfHyc

### First-class Drupal Integration

**Shane Thomas, Staff Software Engineer at Gatsby**

Content editors, not developers, spend more time on finished sites than anyone else. For an ideal experience, they must be able to preview published content, have a workflow that suits their editing needs, and to know when content will go live. Shane Thomas, Staff Software Engineer at Gatsby, presents the Gatsby Drupal Module. Check out Shane’s video demonstration of how draft blog posts immediately appear in preview -- but without triggering a build. When ready, pressing “publish” triggers a new build that takes advantage of Incremental Builds on Gatsby Cloud for lightning-fast rebuilds up to 1000x faster than standard solutions.

https://www.youtube.com/watch?v=Mm6wrDr2DBE

## Coming soon

For many of our attendees a favorite part of previous Gatsby Days events has been the lightning talks, quick peeks at in-process projects given by various Gatsby team members. This time around, we have pre-recorded these five minute flash presentations of cool stuff coming soon for your viewing pleasure.

### Gatsby Blog Theme v2

**Laurie Barth, Staff Software Engineer, Gatsby Themes team**

Laurie’s lightning talk introduces the exciting new features of Blog Theme 1.6/2.0, which will be available soon. Previously, sharing blog posts on social media would result in blank social cards. Now, with improved SEO, you can set featured images and social sharing images on your posts. We’ve also increased the features available in Theme UI, allowing you to highlight lines of code snippets with Prism. The blog theme is overall more customizable too. You can set base styles without any shadowing (though shadowing is still available). See Laurie’s demo of how to completely alter a theme’s appearance in just a few seconds by setting base styles to the community-made `theme-ui-sketchy-preset`, changing the `prismPreset` option, and adding a font using `webFontURL`. We’re excited to see what you build with Gatsby Blog Theme 2.0!

https://www.youtube.com/watch?v=4PNvVCzEFeI

### The Path to Instant Builds

**Matt Kane, Staff Software Engineer, Gatsby Core team**

In the olden days, like last year, there was a price for fast static site runtimes: slow build times. Incremental Builds on Gatsby Cloud changes everything by achieving builds under 5 seconds for data changes, even for sites with hundreds of pages. After all, the fastest way to build is to not build at all! Watch Matt explain the path to instant builds: how we achieved our goal of all data changes taking under 10 seconds to build, and how we’re working on making even more builds, like code changes, incremental as well. The changes we are implementing in the open source project will benefit all Gatsby users. Soon we’ll be able to support super fast incremental building of massive sites, code changes, filesystem data changes, and hybrid content formats like MDX.

https://www.youtube.com/watch?v=z6-MPZrC98g

### Unified Routes

**Blaine Kasten, Staff Software Engineer, Gatsby Core team**

Got routes? A crucial part of building any website is the routing structure: which pages exist and how they’re built. We believe website creators shouldn’t have to delve into Gatsby Node APIs to accomplish key goals. Gatsby v1 introduced the low-level `createPage` API to accomplish this task. While this API is pretty powerful and flexible, we've long wanted a higher-level API that helps developers create sites even faster. In this lightning talk, Blaine introduces Unified Routes, a suite of new APIs and conventions to make the file system the primary way of building pages. Want to see at a glance what routes your site has? Blaine shows you how with his video demonstration of creating routes that take parameters while unifying routing within the pages directory. (Spoiler alert: there’s also a new conversion tool that automates converting your site from using `createPages` to the new API).

https://www.youtube.com/watch?v=tAcAkqOcs3c

### Gatsby Ambassador Program

**Caitlin Cashin, Community Manager at Gatsby**

Interested in taking your involvement in the future of Gatsby a step further? Caitlin tells you how in her lightning talk by introducing the Gatsby Ambassador Program (working title). Ambassadors will act as representatives of Gatsby in community activities like public speaking, teaching, organizing events, and more. Our Developer Relations team will work with them to define and support projects. Right now we are gearing up for a pilot project with a few community members to figure out their needs and how we can best support them. We are also looking to build resources for people who want to become Gatsby Ambassadors but haven’t yet reached the experience level we’re looking for. Eventually, once fully built out, the program will open up to the public.

https://www.youtube.com/watch?v=m-4J62bC5tI

### i18n Theme

**Lennart Jörgens, Senior Software Engineer at Gatsby**

Internationalization (i18n) can be time-consuming, cumbersome, and require significant domain knowledge. For Gatsby projects, it also currently requires lots of manual work. In his lightning talk, Lennart introduces the alpha version of `gatsby-theme-i18n`, a Gatsby theme to make the process of internationalizing sites easier. The alpha version of `gatsby-theme-i18n` will be released soon and, once stable, will become an official i18n solution for Gatsby websites.

The alpha version of the theme will be agnostic to any i18n library and include support for MDX and local pages. The theme will use a JSON configuration file to generate pages such as `index.de.mdx` from `index.mdx`. The theme also ships with React components such as `LocalizedLink`, which handles adding prefixes, like `/de/`, to URLs as needed. Future ideas include supporting any data source, platforms like Crowdin, building both a single site and multiple sites, and more. Discussions are welcome on the [Gatsby Discord server](https://gatsby.dev/discord).

https://www.youtube.com/watch?v=p-TyigucHcU

### New WordPress Source Plugin

We're also hard at work building a brand new first-class Gatsby integration with WordPress, which will be launching next month. Our goal at Gatsby is to empower WordPress users and developers to do the same things they do with WordPress now, but better. Stay tuned for (a lot) more on the new Gatsby Source WordPress plugin, which will allow WordPress users to take advantage of the world’s most widely used CMS to own and manage their data -- while also being able to take advantage of Gatsby’s modern JavaScript ecosystem and tooling. We believe that combining Gatsby with WordPress can give developers and users the best possible developer and content creator experience. The [experimental version](https://github.com/gatsbyjs/gatsby-source-wordpress-experimental) has been available in alpha for awhile, and we can’t wait to reveal the beauty of the beta next month!

## Behind the Scenes

Another traditional feature of Gatsby Days: insight from Gatsby team members on the work they do to continually improve Gatsby for all users. Here are two more lightning talks to shed light on what’s been happening behind the scenes recently.

### Tasty Bits of Design Research

**Shannon Soper, Product Designer at Gatsby**

Shannon’s lightning talk takes a quick tour of error messages and Recipes through the lens of a Usability Test Session. These sessions are live calls between a volunteer user, Shannon, and a Gatsby engineer, where you share your screen working through a task while they take notes and ask questions. Although encountering and debugging errors often feels painful, Shannon uses this process to emphasize that it’s never your fault. The mindset within Gatsby’s UX team is that the product is at fault, and it’s our job to uncover issues and identify areas for improvement. Watch as Shannon walks through a recent usability test to show how they work -- and encourage more community members to try doing one! If you’re ready to sign up for a usability test, [book a time on Shannon’s calendar](https://calendly.com/shannon-soper). You can also share screen recordings by sending them to [design-team@gatsbyjs.com](mailto:design-team@gatsbyjs.com)

https://www.youtube.com/watch?v=Hp_cJGwT1Jc

### Making Gatsby Faster

**Ward Peeters, Software Engineer at Gatsby**

Gatsby is already pretty fast by default. We do a lot of things under the hood to make it that way, and we are always looking for every possible way to capture even split-second speed gains. Ward Peeters, Gatsby’s resident runtime performance expert, shares a few easy things users can do to speed up their sites, like replacing React with Preact (using a Gatsby Recipe to make building it faster, too!). After a certain point, though, there’s only so much a user can or should do, and Ward’s lightning talk takes a look at initiatives currently on Gatsby’s roadmap for achieving further runtime reductions.

https://www.youtube.com/watch?v=4nEGpFtOj-M

## More to come

Please check in over the next few weeks as we continue to present recorded talks from our community presenters. There’s some truly creative, educational and above all fun information on the way!

And thank you once more for being part of the amazing and inspirational community around Gatsby. You belong here, and furthermore we couldn’t do it without you. 💜 We are looking forward to the next Gatsby Days in October for us to gather once more, whether virtually or physically. Until then, keep in touch and let us know about all the cool things you’re building with Gatsby!
