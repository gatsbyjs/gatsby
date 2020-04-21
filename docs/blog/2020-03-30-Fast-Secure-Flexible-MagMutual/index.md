---
title: "Fast, Secure, and Flexible: MagMutual.com Taps the Power of Gatsby + Drupal 8"
date: 2020-03-30
author: Tara Arnold
excerpt: "MagMutual’s web team built their new site using Gatsby, harnessed to Drupal 8, to deliver easily managed content and customer experience, incredibly fast."
tags:
  - drupal
  - gatsby
  - netlify
---

MagMutual, a leading professional healthcare liability insurer, needed to redesign and re-platform the company’s [MagMutual.com](https://www.magmutual.com) website to further its core mission: to serve and protect policyholders.

![Overview of the new MagMutal website UI](./MagMutual_design_sm.png)

To achieve the company's vision for their new site, MagMutual collaborated with [Mediacurrent](https://www.mediacurrent.com/), the Atlanta-based open source development and digital marketing agency. The new MagMutual.com united Drupal and Gatsby to form a fully open source, enterprise-grade system that empowers MagMutual’s web team to closely yet easily manage content and customer experience.

## The Challenge

Realizing their Drupal 7 platform wasn’t going to evolve with them for the long-term, MagMutual began searching for a solution to accommodate multi-faceted search dynamics and complex user authentication requirements pulling data from multiple services and APIs. They needed a ‘single source of truth’ for all data. With Drupal 9 on the near horizon, preparing for a smooth upgrade path was critical.

For MagMutual, the best path forward was an enterprise-grade CMS built on an open source Drupal 8 foundation. Performance and speed were driving priorities. Internally, the marketing team needed more customization control to build new pages.

## The Solution

A fully decoupled Drupal 8 system powered by the Gatsby platform lifted the burden from MagMutual’s technology team and put content authors in the driver’s seat. The Drupal 8 backend provides a powerful capacity for content modeling. Gatsby, the presentation layer, adds a robust dimension of UI flexibility and performance.

![Mission statement page on MagMutual.com](./MagMutual_mission.png)

## Results

### _Speed & Performance:_

- 82% - Improvement on homepage load time (18.47 seconds to 3.3 seconds)
- 90% - Reduction in page weight on the homepage
- 25% - Faster load time for The Learning Center over previous site

### _Security:_

Member data is kept secure in its source location but aggregated by Apollo GraphQL in real-time, simplifying business logic on the website.

### _Flexibility:_

A decoupled design approach offers limitless possibilities to evolve the site with any choice of front end tools.

## Built to Scale With Drupal & Gatsby

In this video, hear from project leaders Bob Kepford, Director of Development at Mediacurrent and Ben Robertson, Senior Software Engineer at Gatsby about their development approach and results of the new site.

https://players.brightcove.net/1027729815001/befDVqJZ_default/index.html?videoId=6133184295001

## MagMutual on the JAMstack

Drupal 8, Gatsby, and a [serverless framework with GraphQL](https://www.mediacurrent.com/blog/5-reasons-why-you-should-consider-graphql-server) helped MagMutual achieve its immediate vision for the new site while they reap the innovation potential of these robust open source software communities.

> We chose Gatsby and Drupal to leverage the power of the open source community. The continuous improvements of these technologies work for MagMutual’s benefit.”

- Bob Kepford, Director of Development, Mediacurrent

From a security perspective, he continued, Drupal gave MagMutual a highly secure platform to protect customer information. Meanwhile, Gatsby removes server-side rendering from the equation and reduces touchpoints for attacks.

### _Why Drupal 8?_

- **Flexible integrations:** Bringing user data together into a centralized platform reduces website support costs and ensures a full, accurate view of customer interactions.
- **Content creation features:** Drupal 8 empowers the marketing team to take ownership of content updates and page creation sitewide.
- **Drupal JSON API:** Increases performance flexibility.

### _Why Gatsby?_

- **Speed:** Gatsby’s performance optimization toolset delivers a fast, high-performing site.
- **Powerful UI Creation:** A component library creates a unified design system.
- **Increased Developer Efficiency:** Full control over the markup made for a more productive build process (versus keeping Drupal monolithic). Gatsby uses GraphQL at build time to access content, so when we built the APIs we needed for the account portion of the site GraphQL was a natural choice. This made it easier to bring on new developers to the team - we could tell them to use the same syntax.

### _Why Apollo GraphQL Server?_

- **Central data source:** Creates a single data source for your website, aggregating data from multiple data sources.
- **Data integrity:** Apollo removes the need to sync data from different sources so it can be displayed on the website. Data is queried and retrieved in real-time using a simple API.
- **Developer velocity:** Self-documented API for developers increases efficiency.

### _Why Netlify?_

- **Gatsby host:** Netlify provides hosting of the Gatsby site.
- **Workflow:** Continuous integration and capabilities to set up production and test environments in the same place.
- **Mediacurrent’s top pick:** Netlify is our top choice for Gatsby/Drupal sites. (Check out our cases studies for Mediacurrent.com and the city of Sandy Spring’s digital signage network.)

## Achieving Accessibility in React

Mediacurrent’s development approach is built on high standards for web accessibility. This project inspired us to find the [best accessibility tooling in the React ecosystem](https://www.mediacurrent.com/blog/myth-inaccessible-react).

![Screen showing A11y accessibility testing has passed during Gatsby build](./Gastby_a11y_web.png)

Adding built-in accessibility testing to the living style guide created visibility for all project stakeholders to hold the team accountable for accessibility issues. To share what we learned with the wider Gatsby community, we [open sourced a Gatsby starter](https://github.com/benjamingrobertson/gatsby-starter-accessibility) with built-in accessibility tools.

## Final Thoughts

MagMutual serves the intersection of two rapidly evolving industries: insurance and healthcare. With a resilient, yet nimble framework in place for MagMutual.com, the company can face the future with confidence.

## Resources

- See the [complete case study for MagMutual.com](https://www.mediacurrent.com/work/case-study/magmutual-drupal-8-gatsby).
- Learn more about some of the development tools used for this project in our webinar, [Rain + Gatsby: Fast-Tracking to Drupal 8](https://www.mediacurrent.com/videos/webinar-recording-rain-gatsbyjs-fast-tracking-drupal-8).
- Planning for a decoupled Drupal/Gatsby project and not sure where to start? [Mediacurrent can help](https://www.mediacurrent.com/contact-us).
