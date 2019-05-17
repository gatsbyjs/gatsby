---
title: Sharing Components Across Websites
issue: https://github.com/gatsbyjs/gatsby/issues/14042
---

One of the benefits of multiple teams using Gatsby within your organization is the ability to share React components across different websites.

There are several strategies here.

**Component libraries** are a cleaner and purer approach, but often requiring additional tooling or causing some changes to require pull requests to multiple.

Alternately, teams can implement **systems for component discoverability**, such as Storybook or Styleguidist, on a per-site basis and simply copy-paste desired code across repositories.

<GuideList slug={props.slug} />

--

**Note:** do you have additional ideas on sharing components across websites? We welcome contributions to the Gatsby docs. Find out [how to contribute](/contributing/docs-contributions/).
