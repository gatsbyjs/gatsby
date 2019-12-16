---
title: How we accidentally launched a popular Gatsby plugin
date: 2019-12-12
author: Jari Zwarts
excerpt: "The story of how gatsby-plugin-s3 came to be."
tags:
  - AWS
  - S3
  - CloudFront
  - plugin
  - case-studies
  - festival
---

It all started when we ([Oberon](https://www.oberon.nl/)) noticed a certain pattern among a subset of our clients — festivals.
Their sites tend to have lots of issues with server load and costs.

They are, after all websites that remain largely unused for most of the year — until they’re not. And at those few yearly moments (such as at the start of a ticket sale), server loads can get really, really high.

This makes most festival websites not _particularly good_ candidates for hosting on servers that are shared by multiple sites, because they can bring down all other sites during this brief period.
Additionally, clients are paying a fixed hosting fee for a server that mostly remains unused throughout the year.

In the past we’ve ‘resolved’ these issues by adding an additional caching layer like [Squid](http://www.squid-cache.org/), [CloudFront](https://aws.amazon.com/cloudfront/), etc.
Adding these kinds of extra layers does make you think about why these sites are built as dynamic applications anyway.

For example, festival programme items rarely change after their initial publication, and it’s not like most of the content on these type of sites is particularly ‘realtime’ anyway.

What if we could just keep the entire site static, only updating it if changes were made in one of the data sources?
We could then put it on a pay-per-request static file hosting service (like [AWS S3](https://aws.amazon.com/s3/)), where we can basically scale to infinity if need be, while keeping the costs low during the down periods.

When our company was approached by a [new client](https://www.oerol.nl/en/) (that had sadly earned a reputation for its website failing during peak hours), it felt like the stars were aligned, and we decided to go* full [JAMStack](https://jamstack.wtf/)*.

## Enter Gatsby

Gatsby is a static site generator, based on React.
You can connect Gatsby up to a variety of sources, and query all of it through GraphQL.
Source data can come from anywhere: a REST API, CSV file, database, you name it. It doesn’t need to originate from a GQL source.

In addition to generating everything as static assets, Gatsby also does some additional magic (mainly prefetching and codesplitting) to make your site even better.

They explain this all [much better on their site](/).

We have been using React for about 4 years now, and we’ve largely pivoted to using GraphQL for most of our API’s, so Gatsby was an instant fit, and barely required our frontend devs to learn anything new.

## Deployment

Whilst the transition to Gatsby itself was a breeze, this part is where things got a little tricky.

Because we were already hosting our image assets on S3, it seemed only logical to put the rest of the site on there as well.
At the time however, [AWS Amplify](https://aws.amazon.com/amplify/faqs/) was the only way to go if you wanted to use Gatsby in combination with AWS.

AWS Amplify is a suite of services and tools including continuous integration, code hosting, and [much, MUCH more.](https://aws.amazon.com/amplify/faqs/)

I noticed there were some more downsides to Amplify:

- [Gatsby’s redirect functionality](/docs/actions/#createRedirect) did not work, at all.
  Our client absolutely needed redirects that they could control from the CMS, and in turn, we wanted to control them with the same data source that was already present in Gatsby, not having to write an additional script that would add a lot of overhead.

- [Gatsby’s recommended caching headers](/docs/caching/) were not applied — not very good for your lighthouse scores, and one of the primary reasons we chose Gatsby in the first place.

- Gatsby allows you to have [routes that only exist on the client side](/docs/building-apps-with-gatsby/#client-only-routes--user-authentication).

- Essentially, you declare a starting point — say for example: /users/, and anything past that starting point will get picked up by the client side. Once the client navigates to /users/1, it will dynamically fetch that user from some sort of API. This is great and allows for very hybrid, partially static, partially dynamic applications. However, when people directly navigate to /users/1 , they will get a 404 because it simply does not exist on the serverside, which is kind of an issue.

- We already had a CI service ourselves, and weren’t really interested in learning all these Amplify-specific things that we already had working ourselves just fine.

- Being able to add additional metadata (such as different headers for certain files) was absent.

So, I decided to experiment a bit and a week later, launched a plugin that fixed all of the afore mentioned problems:

- Gatsby redirects now work just like they do on other hosting providers, and can be configured to be permanently or temporarily.

- It applies the recommended caching headers by default which can also be fully customised.

- If a client route is requested from the server side, it redirects them back to the starting point of the client route. (aka /users/1 now redirects to /users/ instead of 404'ing). Preferably we’d rewrite the url completely, but this is not possible with S3 and [gatsby-plugin-netlify](https://www.npmjs.com/package/gatsby-plugin-netlify) does exactly the same.

- Unlike Amplify, it can be ran from your own infrastructure (or an EC2 instance — in which case it won’t need any configuration because it uses the AWS SDK which can automatically resolve the needed credentials!)

- You can now set additional metadata on objects, meaning you can (for example) specify [a custom content type for your objects](https://github.com/jariz/gatsby-plugin-s3/blob/master/recipes/custom-content-type.md).

You can get it here:
[gatsbyjs.org/packages/gatsby-plugin-s3](/packages/gatsby-plugin-s3/?=plugin-s3)

## The result

We launched a beautiful, fast website that was cheap to host and didn’t even flinch whilst serving a million requests during our peak day. Outside of the festival period, costs were minimal. We completely proved that this stack is great for this type of project.

[Check it out here.](https://www.oerol.nl/en/)

Building the plugin allowed us to scale it as far as we needed it without a hitch, with the need for redirects and custom headers showing up fairly quickly as the project went on.

![The final end result, viewable at oerol.nl](oerol.png)

The plugin is now the de facto way of [using Gatsby in combination with S3](/docs/deploying-to-s3-cloudfront/), and the OSS community has mostly picked it up since it’s humble beginnings, adding a lot of stability and cool new ideas:

- Supporting prefixed deploys. (adding the possibility to have [atomic deployments](https://buddy.works/blog/introducing-atomic-deployments#what-are-atomic-deployments))

- Being able to swap out AWS for a different S3-compliant endpoint such as [Yandex](https://cloud.yandex.com/docs/storage/s3/) or [DigitalOcean](https://developers.digitalocean.com/documentation/spaces/).

- Supporting both S3 redirect objects and routing rules. (due to a [50 redirects limit in the latter](https://github.com/jariz/gatsby-plugin-s3#aws-s3-routing-rules-limit))

- Being able to upload really large files. (which to my surprise, [was a pretty hard issue to tackle](https://github.com/jariz/gatsby-plugin-s3/pull/58))

It’s [still a few features away from 1.0](https://github.com/jariz/gatsby-plugin-s3/issues?q=is%3Aopen+is%3Aissue+milestone%3A1.0), but it’s really cool to have seen what started out as a byproduct of a solution to a real world problem, turn into something that is greatly used and appreciated by the Gatsby community.
