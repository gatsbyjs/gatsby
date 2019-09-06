---
title: "Mediacurrent - Maximizing the Potential of Component-Driven Drupal Development with Gatsby"
date: 2019-06-28
author: Caitlin Cashin
excerpt: "Learn how Mediacurrent transformed their development process with Gatsby."
tags:
  - case-studies
  - drupal
  - agencies
---

In our recent webinar, [Gatsby for Agencies and Teams: Better, Faster, Smarter](https://www.gatsbyjs.com/gatsby-for-agencies/), Ben Robertson talked with us about adopting Gatsby at Mediacurrent and how it transformed their development process. Ben is a front-end developer at Mediacurrent where he has established front-end development best practices and led Drupal development projects.

## About Mediacurrent

[Mediacurrent](https://www.mediacurrent.com/?utm_source=gatsbyjs_cbd&utm_medium=blog&utm_campaign=partners2019&utm_content=mediacurrent) is a web strategy, development, and design agency with a team of about 80 employees. They use open source tools to build enterprise-level websites for a diverse array of clients including Weather.com, Guardian Insurance, and Georgia Tech. Mediacurrent is a strong supporter of open source culture and the Mediacurrent team are active members of the Drupal community, contributing code and hosting events across the country.

## Component-Driven Development for Complex Sites

One of the things that excited Ben about working at Mediacurrent was their component-driven approach to building client sites. Rather than creating libraries of page templates, web page designs were broken down into their component parts which were then built completely outside of Drupal in HTML, CSS, and JavaScript. Meanwhile, the client’s style guide would be generated using [KSS-node](https://github.com/kss-node/kss-node) which could then be incorporated into a basic Drupal structure. Once that structure was in place, individual component files were imported wherever they were needed.

<Pullquote>
  “I thought this was an awesome workflow. It gave us a single source of truth
  for each component. The same template was used by both front-end and back-end
  developers. We could reuse that same component anywhere it was needed, and it
  let the front-enders focus more on front-end specific concerns like semantics
  and richer interactivity and accessibility.”
</Pullquote>

Or at least, that’s what the component-driven workflows were supposed to do…

## Trouble in the Integration Layer

Unfortunately, things were not so simple. In addition to the component templates themselves, the front-end team had to code the logic for integrating the component templates with the Drupal CMS data. Placing the logic in the template files made them overly complex and difficult to read, but placing the integration logic on the Drupal side meant writing PHP, which was outside the front-end team’s comfort zone. The front-end team also didn’t necessarily think about or understand all the particulars of how the CMS data is fed into the component templates when they were building them, which meant additional time had to be spent reconciling the templates with the data.

Finally, they were running into performance issues. The typical complex Drupal site is always going to have a variety of performance issues that could originate in the server, hosting environment, instances of bad PHP, issues with file compilation or bundling, and many other spots. Troubleshooting these issues would then require advanced knowledge of Drupal that could only be found among the back-end team.

Despite their best efforts, their component-driven process was being undermined by the quirks and inefficiencies of having to stand up sites within the Drupal CMS. The front-end and back-end teams were frustrated with the amount of effort they had to put into making the integration work, it was pulling their focus away from the front-end and back-end work they were actually there to do, and it was costing the company money.

## Effortless Integration and Performance with Gatsby

The Mediacurrent team launched their first Gatsby project in 2018, and although no one had any previous experience with Gatsby, they were able to meet the project’s tight budget and timeline.

Gatsby’s use of GraphQL turned integration into a smooth, direct process. The simplicity of GraphQL’s syntax meant the team no longer had to spend their time writing complicated integration logic. GraphQL queries could be written to align almost perfectly with JSON objects, speeding up the integration process significantly and eliminating the kind of maintenance required by their previous integration methods.

Performance also became a low-effort task, thanks to Gatsby. Because Gatsby sites are static HTML, the Mediacurrent team no longer had to worry about their PHP or server performance. Plus, Gatsby’s built-in pre-loading and pre-fetching capabilities blew the CMS’s performance-enhancement tools out of the water.

<Pullquote>
  “It's incredible. Like incredibly fast and incredibly easy to set up.“
</Pullquote>

The front-end and back-end teams experienced new levels of productivity. They no longer had to waste time passing integration problems back and forth or troubleshooting esoteric CMS issues. With Gatsby, the front-end team could focus on the front end and the back-end team could focus on the back end, and any new issues that appeared could be pretty clearly identified as belonging to one or the other.

<Pullquote>
  “With the Gatsby site, if something is running slow on the front-end, you know
  that it's a front-end problem because, for the most part, everything is
  rendered in real-time. You can't get away with saying, ‘Oh, the user shouldn't
  have uploaded that large of an image,’ or, ‘Drupal didn't concatenate my
  JavaScript in the right order.’ But on the flip side, if something is not
  available in the API, you know for a fact it's a back-end issue. **The
  separation lets back-enders do what they like and excel at it, and it lets
  front-enders do what they like and excel at it.**”
</Pullquote>

## Looking Ahead: New Opportunities for the Team, New Opportunities for the Agency

The clarity that Gatsby has brought to front-end and back-end responsibilities has empowered the front-end team to develop more advanced front-end skills. Gatsby offers a great new way for team members to start working with React, and, because it solves a lot of back-end integration issues, they’re seeing that more projects can be accomplished entirely by front-end developers.

As Ben and the Mediacurrent wrap up their first successful Gatsby project, they’re already leveraging it in other ways. They recently integrated Gatsby into a new Drupal install profile called [RAIN](https://www.mediacurrent.com/?utm_source=gatsbyjs_cbd&utm_medium=blog&utm_campaign=partners2019&utm_content=rain), and they’re excited to see how much more efficient their processes are in current client projects. Their new level of efficiency makes it more practical and profitable for the agency to take on smaller, front-end focused projects; and every Gatsby build opens them up to more React projects in the future.

Everyone is looking forward to new growth and bright future with Gatsby.

To learn more about Mediacurrent’s work with Gatsby, check out Ben’s Gatsby Days presentation -- [Move Fast, Don’t Break Things: Trends in Modern Web Dev with Mediacurrent](https://youtu.be/QiocnDGnKfs), or read about one of Mediacurrent's client projects in ["Digital Display With Decoupled Drupal 8 & Gatsby"](/blog/2019-07-09-digital-display-drupal-gatsby/).
