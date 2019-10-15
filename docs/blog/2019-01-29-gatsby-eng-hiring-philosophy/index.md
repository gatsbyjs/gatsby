---
title: Gatsby Inc's Product & Engineering Hiring Philosophy
date: 2019-02-07
author: Sam Bhagwat
tags: ["gatsby-inc"]
---

> "A strong team is the most important element of a company’s ability to achieve success.
>
> Especially in startups, a company becomes the people it hires. The first few hires help the founders create the environment they will all work in and help drive the product development process. It is also the team that drives (and interviews) all future hires and their ideas and biases get incorporated in the team.
>
> More importantly, without the right first few people, the culture of the startup might not be conducive to what the founders envision for its future.
>
> On the flip side, a few mediocre or unmotivated people at the beginning of the startup generally spell doom before the first product is released. There is always talk of startup culture, but it is the founders and their first round of hires that define that culture."
>
> -- Vinod Khosla, [Gene Pool Engineering for Startups](https://www.khoslaventures.com/gene-pool-engineering-for-entrepreneurs#section2)

## Introduction

Last year, several contributors to Gatsby.js [created a startup company](/blog/2018-05-24-launching-new-gatsby-company/), Gatsby Inc, to make feature-rich and blazing-fast websites easier to build and run.

**At Gatsby Inc, we’re trying to build an _organization_ (the Gatsby Inkteam) that can execute on the Gatsby product roadmap and vision**. Our philosophy around recruiting and hiring, as well as team-building, in the product / engineering org is designed to achieve this goal.

Because we [work in the open](/blog/2018-09-07-gatsby-values/#work-in-the-open), we wanted to share that philosophy publicly.

### Two Classes of Risk

There are two main classes of risk that face early-stage startups. They are _market risk_ (the risk no one will want your product) and _technical risk_ (the risk that you can’t build your product).

Most startups have little technical risk, and need to primarily overcome market risk. Sure, you can build your SaaS app, but will anyone want to buy it?

Some startups, primarily "infrastructure" ones, face more technical risk at the early stage. These include **SpaceX** (launching rockets), **Cruise** (self-driving cars), and **Boom** (supersonic flight).

Gatsby of course faces some market risk. Crucially, though, we’ve faced and will continue to face non-negligible technical risk as we execute against our product roadmap.

## Identifying Domain Experts to Help Us Solve Hard Problems

As a company and as a project, we need to do a few things that range from highly unusual to near-unique -- that is, almost no one else in the world is doing them.

As a result, we reduce technical risk by bringing domain experts into the Gatsby organization to make sure we can build what we need to build.

Some of the unique things we’re doing include:

### Baking PWAs, React and GraphQL into a web framework

One of Gatsby's goals is to provider users all the benefits of modern web out of the box, from implementing a Progressive Web App (PWA) checklist of features, React, accessibility by default, CSS-in-JS support, headless CMSs, and GraphQL.

Having GraphQL experts as we flesh out the Gatsby’s GraphQL integration via "schema stitching" 3rd-party-applications, and as our users continue to use GraphQL on a daily basis, is crucial.

The same is true of accessibility, CSS-in-JS, and the CMS as we recreate CMS functionality in the [content mesh](/blog/2018-10-04-journey-to-the-content-mesh/).

Several Gatsby Inkteam members have deep expertise on these topics, which is extremely helpful.

We have a reasonable amount of deep React expertise in the Inkteam, but would like to add more. We’ve tried to recruit additional folks, but have so far been unsuccessful. This is not currently (Jan 2019) an urgent task but would be nice in the long run.

### Managing an open-source contributor community (& plugin ecosystem) at scale.

Every open source project recruits a contributor community from its user base.

Some quite popular open-source projects still struggle to maintain large communities, because their target audience is too different from their ideal contributor profile. For example, container projects target application developers, but need C/kernel hackers to contribute to core.

Other projects, like WordPress, Drupal, Kubernetes, and Linux, have vibrant contributor communities with collaboration among hundreds or thousands of developers, assisted by "plugin" systems that make it possible to contribute code decoupled from the main codebase.

Gatsby has the potential to join these projects. We have 1,500+ total contributors, including dozens of regular contributors because:

- Many Gatsby users are proficient in Node.js, which makes up Gatsby’s core code

- Many plugins are re-packaged "user code" -- well within reach for the average Gatsby developer to create.

Several Inkteam members have experience & an intuitive sense for how to manage open-source communities.

### Create a scalable platform to run untrusted code.

When you run other people’s code, they can do lots of interesting things, like [mine Bitcoin](https://twitter.com/amasad/status/1083517163153944576) or try to take down your system.

Most existing orchestration infrastructure is built for companies to run internal, i.e. "trusted" code.

Only a few organizations have tackled the problem of running untrusted code at scale; cloud providers such as AWS, Google Cloud, and Azure, as well as by infrastructure startups such as Heroku.

In addition, creating scalable infrastructure is in general relatively uncommon; most SaaS apps are built to handle gigabytes of data, not terabytes or petabytes. This is also a problem tackled by cloud providers, as well as developer tooling companies, such as Splunk or Honeycomb.

A couple of Inkteam members have this experience, which is very helpful.

### Creating a theme API with modern design tooling // systems // CSS-in-JS built in

As Gatsby themes ship, careful consideration needs to go to how the API looks for composing components, as well as relationships between parent and child themes. These questions resemble the structure of component libraries and design tooling.

Deep experience in modern design systems, MDX, the CSS-in-JS debates, component-first design, are all helpful.

Several Inkteam members have experience with these tools.

### Building a distributed, incremental compiler

One, core, hard CS-y problem we’re trying to solve is creating an incremental/parallelized Gatsby build.

This problem has been solved in larger companies by distributed build tools such as Buck (FB) and Bazel (Google). Solving these problems involves thinking carefully about concepts like [DAGs](https://en.wikipedia.org/wiki/Directed_acyclic_graph); engineers who are good at these can often be found running distributed systems at scale.

We have some Inkteam members with this skill-set, but we'd. If we met someone with the right experience and skillset here, we would be open to bringing them onboard.

## How our philosophy shapes Gatsby today

Why does it matter that Gatsby is made up of people with deep domain expertise?

### Team structure: we’re remote and pay well

_First,_ we’re remote and pay well to support our talent strategy

The need to find domain experts is core to our mission and has shaped our organization. Because of who we’re trying to hire, we’ve become:

- **Remote.** We decided to be a remote team because our contributor base and talent pool are globally distributed.

- **Generously paid...** Some remote organizations try to pay close to local wages; we try to pay close to Silicon Valley wages.

- **…with generous benefits**. 3 weeks of expected vacation, 3 months of paid parental leave and a 4-week Gatsby Sabbatical after 4 years of employment are unusual (at least for US-based companies ☺). We’re typically not trying to recruit engineers who are just out of college; with the level of seniority we’ve recruited for, most of us are between 27 and 40. That’s the time of life when many people settle into long-term relationships and consider, or start, having children. They start to value not just dedication, but also working smart and avoiding burnout. **Our goal as a company is to support your long-term plans.**

### Skills: we value multi-talented people

There are Gatsby-ites who have experience in multiple areas listed above, which makes them even _more_ valuable. That’s because multi-talented people into the organization makes our organization flexible -- they can cover multiple bases and switch projects seamlessly.

In general, it’s a huge bonus when engineers have skills or experience such as:

- Deep familiarity with the Gatsby.js codebase

- Experience in open-source

- Writing talent (_bonus_: has created courses or written a book)

- Public speaking ability

- Previously founded a startup or led a team

- Product thinking

- Design skills

- A high-quality network to recruit

### Collaboration: create an environment of open, collegial collaboration

Team structure/compensation and skills are two pillars of creating an effective product/engineering organization. The final pillar is an environment of effective collaboration and trust.

We have several [Gatsby core values](/blog/2018-09-07-gatsby-values) that inform team collaboration philosophy. These include:

- [Do the right thing when no one is looking](/blog/2018-09-07-gatsby-values/#do-the-right-thing-when-no-one-is-looking)

- [Work in the open](/blog/2018-09-07-gatsby-values/#work-in-the-open)

- [Set and manage clear expectations](/blog/2018-09-07-gatsby-values/#set-and-manage-clear-expectations)

- [Embrace growth](/blog/2018-09-07-gatsby-values/#embrace-growth)

- [You belong here](/blog/2018-09-07-gatsby-values/#you-belong-here)

From company-wide retrospectives to vibrant Slack channels to every Gatsby team member who is stretched by working on something more popular and public than they’ve worked on before, and a myriad of other large and small ways, we try to live these values every day.

### Reach: hire globally

A concurrent goal is to hire a globally diverse team. Ultimately, our goal is for 30% of the web to run on Gatsby, and to build a framework that produces great websites for all web users, we need a globally diverse team -- diverse in terms of national origin, gender, race, background, and so on.

## How our philosophy shapes Gatsby’s growth over time

### Creating the right "seniority mix"

Because our modus operandi has been to start by recruiting domain experts and senior engineers, we have created an organization that is unusually senior.

Most organizations – either tech companies, startups, or agencies – aren’t like this! The best analogies are probably other open-source-based or developer tools companies, such as Honeycomb and Apollo.

A smoothly functioning organization needs alignment between seniority level and project complexity across the organization:

- If a mid-level dev is assigned a domain-expert-complexity project, they will likely be overwhelmed and make little progress.

- If a domain expert is assigned a mid-level-complexity project, they will likely be bored and produce sloppy work.

(There are more failure cases, but these are two common ones.)

**Gatsby’s optimal seniority mix will change over time as our project complexity distribution changes.**

This will happen in two ways.

**As new projects emerge, senior engineers will be needed.** Not all new projects need a senior engineer, but many do. In terms of the pioneer/settler/town planner analogy, new projects are either:

- Frontier (now possible due to recent development)

- Infill development (previously collectively owned; newly dedicated staffing)

Some examples of frontier & infill development that we’re likely to staff in the near future include (Jan 2019):

- Integrations + Plugins (infill development)

- OSS DX + Error messaging (infill development)

- One-click install (frontier)

- Theme marketplace (frontier)

New products provide both _product mobility_ for senior engineers, and _ownership opportunity_ for mid-level engineers.

**As products mature, they need more mid-level engineers**. Over time, as senior engineers and teams map out the landscape and define a problem – as we move from ["pioneer" to “settler” to “town planner”](https://medium.com/org-hacking/pioneers-settlers-town-planners-wardley-9dcd3709cde7) -- the avenue is opened for mid-level engineers to come on board and make concrete progress.

A good example of this is Gatsby core. Gatsby Core, as a ["200,000-line codebase"](https://www.teamten.com/lawrence/writings/norris-numbers.html) needed senior members to seed the team; but now finds a greater demand for mid-level roles.

### Solving the next decade’s problems

The "PayPal Mafia" is a group of early employees, executives, and founders of PayPal. PayPal, was founded in 1998 and sold to eBay in 2002 for $1.5 billion. This was an impressive outcome in a tech landscape littered with dot-com busts; it became even more impressive as PayPal grew inside eBay. Today, Paypal is worth over $100 billion.

After the acquisition, there was a diaspora of PayPal employees/founders; ex-PayPal-ers went on to found and lead most of the most successful startups of the next fifteen years, including SpaceX, Tesla, Facebook (1st investor), YouTube, Yelp, LinkedIn, and Square.

Ex-PayPal-ers attribute this unusual outcome to two things.

- **First, early employees wanted to make a dent in the universe**. PayPal filtered for people who cared about the company’s idiosyncratic, frighteningly ambitious mission: create a parallel currency to the US dollar (they were about 20 years too early…).

- **Second, the PayPal culture was created by early team members.** Not all the PayPal-ers who went on to make an impact were early employees; however, they were all recruited, interviewed, hired, and socialized by early employees.

At Gatsby, we’re building the future of the content web.

In five years, we believe 7% of the web will be running on Gatsby. All of us at Gatsby will be shaping how that happens. Over the next 10 to 20 years, the content web -- how we compose and curate content, design, develop, and deploy our sites, and interact with readers will be shaped by your work.
