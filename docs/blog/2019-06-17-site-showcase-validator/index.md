---
title: Maintaining the Site Showcase with GitHub Actions and the Gatsby Site Showcase Validator
date: 2019-06-17
author: Benjamin Lannon
excerpt: "Keeping the Lungevity of the Site Showcase strong is to continue bring in exciting sites that use Gatsby, but as well to keep our existing showcase up to date."
tags:
  - github
---

Gatsby has rapidly been growing in the market of static sites. As such, the core team developed the Gatsby Site Showcase to present a variety of websites using Gatsby. As the showcase grew and has hundreds of sites, long term maintenance would help strengthen the showcase.

## Why a validator

As with most websites, nothing is constant. Designs and even frameworks that companies and developers use to build sites will evolve and change over time. With that, it would be diligent to make sure that Gatsby’s showcase is kept updated and all sites in the showcase are still using Gatsby. Doing this by hand would become unmaintainable as more and more sites are added but automating the workflow would alive the burden for a important task.

## Creating the validator

At its core, the validator is a script written in NodeJS that examines every site in the site showcase and checks on if the site is up and then examines the HTML for key identifiers that point out that the site is written with Gatsby.

All Gatsby sites by default have a container element with the `___gatsby` id as an attribute which is where the react app will be mounted to when Gatsby rehydrates on client load.

With such, a HTTP request can be done to grab the initial HTML of the page. Then it can examine the DOM using [cheerio](https://github.com/cheeriojs/cheerio), a jQuery-like DOM parser designed for the server. If it is able to find the Gatsby root container, it will continue on to the next site. If not, it marks down the site and will fail the validator upon completion.

For deployment, we decided upon [GitHub Actions](https://github.com/features/actions) which allows for a script like the validator to live inside the Gatsby Git repository and be run on a daily schedule on GitHub’s servers rather than needing to spin up separate infrastructure for the script.

## Benefits and moving forward

The validator was merged into Gatsby Core in late May and it has brought a sense of security as more entries are accepted into the Site Showcase. Core maintainers can check the validator and then if the validator finds sites no longer using Gatsby, we can contact maintainers and clarify if it was their intention.

In the future, the validator can be extended and composed with other tools to better inform maintainers of outliers and how we can keep the showcase and other platforms in check.
