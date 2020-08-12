---
title: "Research on i18n with Gatsby"
date: 2020-07-13
author: Lennart Jörgens
excerpt: "As lead engineer on the Gatsby i18n initiative, I knew right from the start that internationalization and localization are multi-faceted problems requiring an iterative solution process with involvement from the community. To best understand what this process should look like, I needed to identify the current pain points as well what future considerations need to be kept in mind in designing a solution."
tags:
  - i18n
---

During Gatsby Days Reconfigured last month [we previewed quite a few exciting projects](/blog/2020-06-23-Reconfiguring-Gatsby-Days/) to be released soon. These launches are aimed at helping developers transition their CMSs into the headless CMS era; enabling content creators to use Gatsby more easily and intuitively; and, simultaneously, improving the developer experience for our current and future users. One of these exciting new announcements actually ties all three of these goals together: a sneak peek at the development of our own [i18n theme](/blog/2020-06-23-Reconfiguring-Gatsby-Days/#i18n-theme). It's the first step towards having internationalization in Gatsby as a first-class citizen, and we are looking to launch by the end of the month.

First, though, we’d like to share the research process we’ve followed in developing the i18n theme, and the pain points we sought to solve. The goal in sharing these findings is to start an open discussion and invite your feedback. If you’re interested in contributing, please join the [Gatsby Discord channel](https://discord.gg/cQ2MPUz) and add your voice to the conversation!

## Why i18n?

Gatsby’s diverse and highly creative users want to use Gatsby for every project and purpose...Meaning there’s also one or more plugins assisting each one of those use cases. This is great! Given Gatsby’s truly global community, many of these plugins support internationalization (i18n) -- the process of building your website or app to support multiple languages -- and localization (i10n).

(Localization goes beyond language translation to also adapt content and presentation to reflect varying cultural preferences and nuances. That said, internationalization and localization pretty much present the same problems, so we will be using the terms interchangeably as we explore the problems Gatsby users commonly face integrating Gatsby and i18n).

As lead engineer on the Gatsby i18n initiative, I knew right from the start that internationalization and localization are multi-faceted problems requiring an iterative solution process with involvement from the community. To best understand what this process should look like, I needed to identify the current pain points as well what future considerations need to be kept in mind in designing a solution. With these in mind, I started researching the current i18n ecosystem in Gatsby.

## Current pain points

Currently, high level pain points for our users are that they often have to choose between multiple plugins and then implement everything on their own. Scalability also presents a challenge, because having your site in two languages already doubles your page count. There are also numerous more specific issues affecting users seeking to implement i18n with their Gatsby sites or apps.

This is a non-exhaustive list of issues I most commonly read and heard. Feel free to share any other problems with me (on [Discord](https://discord.gg/cQ2MPUz)) that you see as important to the overall development of Gatsby’s i18n strategy!

1. **Generating separate pages for each locale requires greater effort and knowledge from the user than usual.** Passing around the necessary information via `pageContext`, creating new pages from existing ones, and creating some sort of config to control that is complicated. There are some pitfalls when using the `onCreatePage` API and `pageContext` that might lead to unexpected errors or performance degradation.

2. **Using information from non-local files (e.g. headless CMS) in certain parts of Gatsby is (nearly) impossible.** Developers and creators typically want to define everything in the CMS -- design system tokens, language strings, other language settings -- and any other information that would go into `gatsby-config.js` or every created page. Problems that arise include trying to use the language strings from the CMS in your application without bloating the page context with every translated string.
   Also, friction can occur when sourcing from remote repositories due to problems with relative paths.

3. **Integrating i18n into an existing Gatsby site.** Gatsby has powerful APIs to create and modify pages and enables plugins to use those. Sometimes a combination of certain plugins or patterns can lead to unexpected problems.

4. **Some i18n/i10n libraries have poor or complicated SSR support.** Due to Gatsby's nature, libraries that do not guard against SSR usage can cause problems.

5. **Modifying `gatsby-link` is necessary.** To keep the benefits of using `gatsby-link` you have to wrap the component with your own implementation of accessing the current locale and adapting the path accordingly.

6. **Localization of GraphQL queries.** When querying for things like dates you need to have access to the correct `dateFormat` for the current locale.

7. **Lack of support for multiple builds from one run of the `gatsby build` command.** The use case here is that, from one source, multiple sites need to be deployed to `en.domain.tld`, `de.domain.tld`, etc. Also, sometimes those sites themselves contain multiple languages (e.g. `de.domain.tld` has English and German options).

8. **SEO needs to be handled manually.** The correct meta tags and redirects need to be set in the head; options for different titles/URLs for each page are missing.

9. **Right-to-left support has to be added manually.** Adapting the styles has currently no happy path.

10. **Difficult to integrate SaaS localization platforms.** There are not many plugins that deal with localization platforms such as Crowdin and Transifex, meaning you have to handle the integration yourself. This can be difficult.

## What this means for future development

As the list above clearly shows, i18n (and by extension i10n) is a topic presenting a wide variety of challenges. Both specific usage problems like issues with Gatsby's APIs and integrations with third-party libraries, and general topics like SEO or styling adaptations.

While some of those things can be packaged and abstracted into a theme (as with `gatsby-theme-i18n`) not all pain points can be solved with a plugin. Changes to Gatsby's core or third-party libraries such as Theme UI are necessary to fix some things. Building child themes for i18n libraries or creating happy path boilerplates for certain common types of projects can also give a better experience for users.

Most importantly the great variety of responses received thus far showed that our users are passionate about this topic and have a strong desire to see it solved in Gatsby so that they can keep on using it -- which is exciting!

## What's next?

The alpha of `gatsby-theme-i18n` and its child themes will be released very soon. Until then (and in the future, as well) you can join the [Discord channel](https://discord.gg/cQ2MPUz) to chat as more details on how to contribute will follow. Also, keep an eye out for the announcement post.

I encourage all interested parties to try out the theme when it's ready and get involved in the process of refining it. And then show us the awesome things you build!
