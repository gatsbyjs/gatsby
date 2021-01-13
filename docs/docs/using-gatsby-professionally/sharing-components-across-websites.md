---
title: Sharing Components Across Websites
issue: https://github.com/gatsbyjs/gatsby/issues/14042
---

One of the benefits of multiple teams using Gatsby within your organization is the ability to share React components across different websites.

There are several strategies here.

**Component libraries** are a cleaner and purer approach, but often requiring additional tooling or causing some changes to require pull requests to multiple.

Alternately, teams can implement **systems for component discoverability**, such as [Storybook](https://github.com/storybookjs/storybook) or [Styleguidist](https://github.com/styleguidist/react-styleguidist), on a per-site basis and copy-paste desired code across repositories.

To avoid copy-pasting and reuse components instead you can use **component-sharing tools** such as [Bit](https://github.com/teambit/bit) to reuse and sync components between websites.

<GuideList slug={props.slug} />

---

**Note:** do you have additional ideas on sharing components across websites? We welcome contributions to the Gatsby docs. Find out [how to contribute](/contributing/docs-contributions/).
