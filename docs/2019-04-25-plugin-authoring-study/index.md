---
title: "Improvements to Plugin Authoring Experience"
date: 2019-04-25
author: Shannon Soper
tags: ["ux", "plugins"]
---

We recently interviewed authors of popular Gatsby plugins; here's what we learned and how we're changing to support plugin authors!

## Stats on interviewees

We interviewed 6 authors and/or contributors of popular plugins, including Espen, Orestis, Tyler Barnes, Chris, Mike A., Michal P., and Ali Mahmoud. Thanks to all for taking the time to give thoughtful interviews!

> Are you a plugin author/maintainer? If you have additional feedback that is not covered by this article, please [let us know here](https://docs.google.com/forms/d/e/1FAIpQLSfhZOKcnbGvAYAzwWUXuVNkeGFGDHZP8DNdabj7CUG27kBngg/viewform?usp=sf_link)
> If you're thinking of creating a plugin, [sign up for a CLI usability test](https://calendly.com/shannon-soper/gatsby-research-call-gatsby-cli). You'll get to try out some new things in the CLI!

## Why do people decide to create a plugin?

We asked people what motivated them to create and maintain a plugin so we can make sure to support them in their goals. Most plugin authors we interviewed said something like: “I created the plugin to solve a problem I had that other plugins couldn’t solve". Typically, other plugins couldn't solve the problem because they weren’t v2 compatible, weren’t being maintained, or didn’t exist.

For example, Tyler Barnes is working on alternative WordPress source plugin, with a functionality closer to how Netlify CMS works as opposed to pulling from the WP REST API every time.

Why? Pulling all data and images every time he started `gatsby develop` was annoying — some of the sites were big and it could take 2 minutes to download. Local images would get dumped so he’d wait 10 minutes for the images to get processed again. Some cheaper servers were limited and would crash when trying to handle large numbers of images. He said he “wanted to make WP and Gatsby work on a crappy server.”

What did he do to solve his problem?
He commits the data instead so it’s available on the local machine instead. He was using gatsby-source-wordpress and adding extra stuff to it (permalink support, etc.) and then turned that functionality into a plugin. He basically added the features necessary to make it work like Netlify CMS and didn’t need to use the source plugin anymore.

Creating a plugin isn't the only kind of contribution that helps others; @pieh's story of how he started to contribute to Gatsby involves editing a plugin:“`gatsby-source-wordpress` didn’t handle gallery type fields which I needed for some freelance work. It was my first PR to work on that plugin”.

Other reasons people build plugins include having fun! According to Orestis, “Learning is fun! Actually having people open pull request against my plugins is also fun”. He's the author of `gatsby-source-instagram`, `gatsby-source-dropbox`, gatsby-remark-rehype-images, `gatsby-source-marvel` API, and `gatsby-source-pylon`.

## How can we better support plugin authors?

ANSWER: make time-consuming things take less time, and make frustrating things less frustrating :)

## Make time-consuming things take less time

People who use plugin authoring docs say they are super helpful; however, most people don’t know about them and solve challenges through looking at the source code of other plugins. While this works for many people, we think making this even easier is a positive change.

## Solution

- [Gatsby CLI to add scaffolding for source plugin creation #13376](https://github.com/gatsbyjs/gatsby/issues/13376)
- [Invite new Gatsby users to learn more about plugin authoring via CLI #13377](https://github.com/gatsbyjs/gatsby/issues/13377)

## Make frustrating things less frustrating

It's frustrating that many plugins are outdated or not maintained.

Things that are confusing:

- Yarn link has weird inconsistencies
- People run into issues around processing a lot of nodes in a for loop.
- There's some misunderstanding around how async/await works — one person said they were awaiting everything instead of creating an array of Promises and using Promise.all()
- Most people don’t know how to write automated tests for plugins. Most people mentioned building a site alongside the plugin to test the plugin, which they felt wasn't the most ideal way to test.
- Rebuilding for every change often “feels wrong” to people

## Solution

[Redesigned the plugin docs](https://github.com/gatsbyjs/gatsby/pull/13261/files) to include a category called "Creating Plugins" where we can document answers to people's concerns; for example, ideas for how to test plugins and advice to use yarn workspaces to avoid yarn link inconsistencies.

## What we need help with

It'd be great to get help with any of the following:

- Use schema customization since this solves one of the biggest complaints of plugin authors!
- Add your tips and tricks to the [how to maintain a plugin docs page](https://www.gatsbyjs.org/docs/maintaining-a-plugin/)

* Comment on this issue: [Gatsby CLI to add scaffolding for source plugin creation #13376](https://github.com/gatsbyjs/gatsby/issues/13376)
* Comment on this issue: [Invite new Gatsby users to learn more about plugin authoring via CLI #13377](https://github.com/gatsbyjs/gatsby/issues/13377)

- stay tuned for a @jlengstorf video on plugin authoring with Mapbox
- Add a “processAllNodes()” helper that automatically sets up the Promise.all() so people don’t need to know how this works
- Plugin library default filter set to v2 compatible. Script to grab file, looks for exported APIs that aren’t compatible
- Create end-to-end tests for plugins (more needed for internal/core plugins where we want to test the outpout)
- Create #plugin-authoring Discord channel and publicize #contributing channel more
