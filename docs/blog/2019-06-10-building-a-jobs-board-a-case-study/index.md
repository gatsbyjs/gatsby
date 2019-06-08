---
title: Building a jobs board with gatsby, a case study
date: 2019-06-10
author: Steven Natera
tags:
  - case-study
---

Today we are going to discuss how we built [Remotefordays](https://remotefordays.com), a jobs board for remote software engineer roles, with gatsby. First we'll discuss how we made came to our tech stack, then we'll talk about the the gotachas, and falls starts we encountered along the way.

# Components of the tech stack

Gatsby is an amazing tool for rapid prototyping high performance websites on the frontend. We can get a new project started without much hassle due to a phenominal developer experience. Therefore choosing gatsby for our frontend concerns was easy. Next we needed to decide how to build and store job listings.

Since we are using gatsby, we were tempted to build the job board as a static site. After all, the content is not going to change after the initial job post. But there is a subtle requirement in a jobs board that requires the site to be designed for dynamic actions.

When a customer purchases a listing they should see their posting right away on the front page. If you chose to provide this functionality as a static site, using a CMS, in order to show the job listing on the home page you would need to rebuild, and redeploy the site for every new job listing. Our system design yields a reasonable trade-off for the first tens of listings.

With the current system design, as the site grows to a couple hundred listings or a few thousands, site build times jump to many minutes because we're rebuilding from scratch each time and not from the changes since the last version of the site. Moreover, if we're using a CI/CD system, we now added a CI minutes building a site with none testable content changes which increases costs, and increases the time it takes a customer to see their job listing.

Instead we need to build our job site with a frontend client that queries API (NodeJS) endpoints at runtime, the API will then query a database (MongoDB, for flexibility) to create or list a job. With this setup we can, post a job, and asynchronously update the main front page to include the latest listing when the transaction has been processed. 

Now that we have a system design we are happy with, we can talk the false starts that inspired this current design since you know, hindsight is 20/20.

# Gotchas and false starts along the way

The biggest gotcha focused on job listing SEO and the server-side rendering of job detail pages. The detail page was designed to fetch data for a specific job post based on the unique ID passed through from the front page. We implemented this feature using client-only routes because we figured this approach to be the "gatsby way" of working with apps, based on an article focused on [building hybrid apps](https://www.gatsbyjs.org/docs/building-apps-with-gatsby/) with gatsby.

However we found out that these pages could not use React Helmet to add meta tags for social media sharing. The culprit of this problem lies in the fact that gatsby pages are served using the React.Hydrate function which is how gatsby generates server rendered pages, processed with ExpressJS at build time. Pages rendered via React.Hydrate load twice on the frontend. On first call, the React lifecycle methods are unavaliable afterwards, lifecycle methods are available to make API calls. Due to this rendering process we were not able to make API calls in `componentDidMount` to have the data present before we added SEO tags with React Helmet. Boo!

To solve this problem we added request forwarding at the CDN level and moved the details rendering logic to our backend ExpressJS app. When the user requests a job post details, the request goes to a backend app, we generate a job post with the proper SEO meta tags, return a response with the proper data, and then cache the response for future requests. After we made these adjustments we were able to have shareable job posts. Yay!

# Final thoughts

To recap, we built a remote jobs board with gatsby as our frontend client because we wanted performance from the start. We deployed our site on [Netlify](https://netlify.com), configured CDN request forwarding with Netlify, used a backend ExpressJS app, deployed on [Google Cloud Appengine](https://cloud.google.com/appengine/), to handle the serving of job detail pages. We hit a frustrating blocker for a critcial feature that caused us to discard core gatsby logic and reimplement that logic on the backend. Given what we know now, would we choose gatsby again? Absolutely! Though we were not able to leverage gatsby to its full potential, we're confident that many more opportunities are on the horizon. To learn more about me you can follow me [@stevennatera](https://twitter.com/stevennatera) on Twitter. Thanks!

## Gatsby Manor

[Gatsby Manor](https://gatsbymanor.com) builds professional design Gatsby themes. We make themes to meet your project needs, with new starters added frequently. Can't find a theme you like? Message us [@thegatsbymanor](https://twitter.com/thegatsbymanor) and we'll build a theme for you!

