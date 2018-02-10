---
title: "Why I created my blog with Gatsby and Contentful"
date: 2017-11-09
author: "Fernando Poumian"
---

I recently deployed my new blog at
[halfelectronic.com](https://www.halfelectronic.com) and I thought it would be
fitting to talk about how I built it in the first place -- you know, me being a
web developer and all.

There is certainly no shortage of options when it comes to platforms and CMSs to
build a blog these days: From the more traditional, cumbersome and usually
troublesome PHP based ones -- I'm looking at you Wordpress -- to the more
minimal and modern ones like Ghost, Medium and Tumblr.

However, in my experience, I found that pretty much all of these options
typically force you to give up at least one of the following:

* Money: As in the money you spend per month keeping the blog up and running.
* Time: As in the time you spend maintaining, scaling and securing the blog
  infrastructure once it has been deployed (i.e. DevOps time).
* Control: As in the degree of control you have over the blog's appearance,
  performance and architecture.

This last point refers more than anything to online publishing platforms like
Medium and Wordpress.com -- not to be confused with the self-hosted Wordpress
alternative, which we'll discuss in a moment. And while that lack of control
might not represent a problem to many bloggers, I often find it too limiting for
my taste. I like to have my own domain, my own URL structures, my own color
scheme and my own silly sidebar widgets which display what song I'm listening at
the moment -- yeah, that's a thing I implemented 😁.

By the same token, the idea of not having to worry about keeping your blog up
and running 24/7 is certainly an appealing one. When you publish an article on
Medium.com you know that no matter how many people read it, it is very unlikely
that Medium will crash and people won't be able to access it -- and if it
happens, it's not really your problem anymore!

It will be your problem, however, if you decide to create your own custom blog
using a typical self-hosted Content Management System, and you will most likely
have to solve that problem by either throwing money or time at it.

Let's take a Wordpress self-hosted installation, for example, simply because
it's the most common type of CMS out there and it's the one I have the most
experience with.

First of all, you are going to need to host your blog on a server
running PHP and MySQL. No biggie right? After all, there are thousands and
thousands of hosting companies out there who make a living out of provisioning
shared hosting environments with PHP and MySQL every day. Evidently, those
hosting companies are out there to make a buck or two, so they will charge you
an amount to host your new blog on their servers, which only seems fair.

If you are a little bit more tech savvy and have experience provisioning
software in a Linux distribution, you might prefer to rent a droplet from
Digital Ocean and host the blog yourself. This, in turn, will allow you to have
greater control over your site. However, you will also to pay for that droplet,
even if it's the cheaper $5/month one.

Whatever path you take, let's say that you now have your new Wordpress blog up
and running. Now what?

Well, you're most likely gonna want to spend some time securing that site
against hackers. Why? Because hackers love Wordpress sites. Don't believe me?
Ok, just Google the words "Wordpress hacked" and be prepared to read some really
nasty horror stories. As someone who spent three years working as a Wordpress
developer I could tell you some of those myself, but let's leave that for
another day.

Now, I am not saying that the Wordpress Core is an insecure piece of software --
because I genuinely believe it is not. However, I do believe that Wordpress
suffers from the same kind of "ironic luck" that Windows has as an Operating
System; that is, because of its massive popularity, hackers have a lot of
incentives to try and find security vulnerabilities on Wordpress installations,
and they often succeed at that. In that regard, you might even say that
Wordpress is _the_ Windows of Content Management Systems.

Alright, let's say that you have done enough to secure your site and start
writing your posts.

<div style="width:100%;height:0;padding-bottom:100%;position:relative;"><iframe src="https://giphy.com/embed/VBwXWPvUdxzPi" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div><p><a href="https://giphy.com/gifs/funny-computer-virus-VBwXWPvUdxzPi">via GIPHY</a></p>

Unfortunately, you start realizing that your new awesome Wordpress blog is
actually kind of slow...

<div style="width:100%;height:0;padding-bottom:55%;position:relative;"><iframe src="https://giphy.com/embed/kkpcRessCvNyo" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div><p><a href="https://giphy.com/gifs/angry-computer-frustrated-kkpcRessCvNyo">via GIPHY</a></p>

There are many reasons this could be happening: Maybe your shared hosting
provider sucks, or maybe that shiny new $50 theme you bought on ThemeForest
actually contains a lot of crap code -- a very common and too well-known
scenario.

So, what do you do? Well, if you care about your readers and/or your SEO
strategy, then you will probably need to invest some time optimizing your site
speed, which in my experience might have varying degrees of success depending on
your setup and technical expertise.

If you were clever enough to get your own Digital Ocean droplet and configure
your own Apache instance, then you could definitely implement a cache layer with
something like Varnish, which could help make your blog run a lot faster. If
not, you will probably have to leverage one of those "magic" Wordpress cache and
minification plugins, which in my experience are very unpredictable and
unreliable, and which might also introduce more security vulnerabilities to your
site.

Well, let's assume that despite all of this, one way or another, you manage to
establish a fairly successful Wordpress blog with a decent reader base. Now the
million dollar question is: "But will it scale?"

What will happen if one of your posts gets picked by Reddit or HackerNews and
suddenly you start getting tens of thousands of simultaneous hits? Will your
shared hosting provider be cool with that? (Spoiler alert: They probably won't.)

If you are managing your own server, did you configure Varnish correctly? What
if MySQL crashes while you are away on vacations? _What if? What if?_

Now, I'm not trying to be pessimistic here. These are very realistic scenarios
that I regularly came across in my years of experience as a Wordpress developer.
Turns out that managing and scaling traditional monolithic LAMP stack
applications is usually a time-consuming task, to say the least.

You might decide to take the easy route and host your blog on a Wordpress
specialized hosting service like [WP Engine](https://wpengine.com/), which will
take care of all things related to security and scaling for you. But then you
better be prepared to set aside $29 each month, which is what their cheapest
plan costs.

I don't know about you, but spending $29 each month on a simple blog seems a
little bit excessive to me, especially considering we could be spending next to
nothing and end up with an infinitely more secure, scalable and faster website.

Say what?

<div style="width:100%;height:0;padding-bottom:75%;position:relative;"><iframe src="https://giphy.com/embed/xT0xeqCPRLHBUvWa88" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div><p><a href="https://giphy.com/gifs/way-orange-better-xT0xeqCPRLHBUvWa88">via GIPHY</a></p>

## Enter the world of static site generators...

If you are a developer, you probably are familiar with Static Site Generators,
or you have at least come across a site that was built with one, even if you
didn't realize it. Up until recently, they have been mostly used for
documentation sites of open source projects, because they are very cheap to make
and because you can host them for free on
[GitHub Pages](https://pages.github.com/).

For those very same reasons, developers also often use them to create their own
personal blogs and portfolio sites, which only makes sense right? After all, if
you are a developer you probably don't need a nice GUI to write Markdown posts
and you are most likely comfortable enough with the terminal and with version
control in order to generate and push an updated version of your blog to GitHub
Pages manually.

Because they are just built with static assets, that means there are no
databases to maintain or secure. GitHub is in itself our database, so to speak.
That also means that our site is extremely unlikely to go down, regardless of
the number of visitors we throw at it.

All that sounds very nice and dandy, but unfortunately the web is not only made
out of open source projects documentation sites and developer blogs -- although
sometimes I wish it was!

Even more importantly, the world is not full of tech-savvy developers who know
their way around the terminal and Git. This, I think, is the main reason why
Static Sites Generators have only enjoyed a very limited success and adoption.
The truth is, managing content in these sites has traditionally required a
certain level of technical knowledge which the average user does not possess.

"But wait, isn't that what Content Management Systems are for?" -- I hear you
asking. See, we have come full circle now!

Why yes, they are!

In fact, they are excellent at doing just that, managing content. Or, in other
words, providing a nice GUI so that both technical and non-technical users can
manage content -- that is, adding it, updating it, deleting it, publishing it as
a draft, etc.

The problem is that the monolithic and highly coupled architecture of most
Content Management Systems out there (i.e. Wordpress, Drupal, etc) usually means
that your CMS will not only manage your content but will also be in charge of
rendering it to the screen; and this architectural choice, in my opinion, is at
the root of many of the headaches I described previously.

If that's the case, wouldn't it be nice if we could have a Content Management
System which only took care of managing content but we also had a Static Site
Generator which could take all that content and render it into a full-blown
static website?

That would give us the best of both worlds, right?

Well, a guy named [Kyle Mathews](https://github.com/KyleAMathews) already
thought of that and created Gatsby.js.

## Generating static websites with React and Webpack

A little disclaimer: I absolutely love React, so, when I first learned that
there were some emerging Static Site Generators who leveraged only React and
Webpack, I knew that I had to try at least one of them for the new upcoming blog
I was planning to build. These projects were [Gatsby.js ](http://gatsbyjs.org/)
and [Phenomic](https://phenomic.io/), and both were still quite young back then,
neither of them having reached the 1.0 release yet.

Ironically I chose Phenomic, mainly because I liked what the guys from
[Serverless.com ](http://serverless.com/)had done with their website at that
time -- built using Phenomic.

So, I went ahead and built my blog using Phenomic. Overall, I thought it was a
very good Static Site Generator. It allowed me to use CSS Modules, PostCSS and
Hot Reloading out of the box, which translated into a very pleasant frontend
development experience.

However, at the end of the day, Phenomic was just another old-school Static Site
Generator like [Jekyll](https://jekyllrb.com/) or [Hugo](https://gohugo.io/), in
the sense that the only data it could handle was Markdown files.

For a simple developer blog, Phenomic might have been enough, but it was
definitely not something I could expect to use in more ambitious projects that
were meant to be updated by non-technical clients. But to be fair, neither were
all the rest of the Static Site Generators up to that point. Yes, Hugo is
insanely fast at generating a lot of pages, and Jekyll has a very mature plugin
ecosystem, but they're projects that focus on creating sites meant to be updated
by developers. You just can't expect the average user to clone a GitHub
repository, add a new Markdown file, add the post metadata in Front Matter
format, commit the changes and push it upstream.

But then Gatsby.js hit the 1.0 release, and everything changed...

## Meeting Gatsby.js

My first contact with the 1.0 release of Gatsby.js was thanks to the Facebook
team behind the [React](http://reactjs.org/) documentation site. They decided to
migrate their legacy Jekyll site to a completely new site built with Gatsby 1.0.
I, as the good React fanboy that I am, jumped at the first chance I had to
submit a PR to help fix a couple of bugs on the site, and was even given the
opportunity of setting up the [RSS feed](https://reactjs.org/feed.xml)!

In the process, I learned what the 1.0 release of Gatsby was all about, and I
was completely mindblown.

<div style="width:100%;height:0;padding-bottom:100%;position:relative;"><iframe src="https://giphy.com/embed/EldfH1VJdbrwY" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div><p><a href="https://giphy.com/gifs/tim-and-eric-mind-blown-EldfH1VJdbrwY">via GIPHY</a></p>

Not only did it have all the standard goodness of a typical React/Webpack static
site generator (CSS Modules, PostCSS, Hot Reloading, etc), but more importantly,
it integrated an incredibly ingenious GraphQL layer which allowed the developer
to query and fetch data from practically everywhere on the web!

For us developers, that means that we are no longer restricted to rely on local
static Markdown files to store the data of our static sites -- although that can
still be done very efficiently as well.

That data can also now be stored on any database or traditional storage device.
We can then leverage GraphQL to retrieve it and render it in whatever shape or
form we wish.

That also means that our clients can now use a proper CMS to manage all the
content of their sites, and whenever they publish, update or delete an entry,
the whole static frontend will be auto-generated from scratch, resulting in a
new version that contains the updated information.

As good as this architecture sounded in my head, I knew that I had to test it
first on a personal project before even thinking on implementing it somewhere
else, and so I decided to re-engineer my finished Phenomic blog using Gatsby
instead. Since the blog was only composed of React components -- which by nature
are extremely portable -- 90% of the job was already done, so I only had to
spend a couple of hours refactoring the top level of the application.

Of course, in order to achieve this setup, there are still some key elements we
haven't talked about. First of all, we need a CMS that allows both retrieving
its entries via an HTTP endpoint, as well as setting up webhooks that can be
triggered when those entries are created, updated or deleted. Fortunately, most
popular CMSs nowadays already support those features, either natively or by
installing plugins (i.e.
[Wordpress REST API](https://wordpress.org/plugins/rest-api/)).

Personally, however, I found the idea of maintaining a CMS server and a database
just for my simple blog not very appealing. Yes, our decoupled architecture
means that if our CMS server or database ever goes down our static frontend
won't be affected at all, but we still need to pay to have that CMS server up
and running listening for requests -- which won't be that many -- and we still
need to spend some time securing that MySQL database. Being a "Serverless"
architectures enthusiast, I set out to find a more "serverless" and economic
approach to this issue. Fortunately, the Gatsby.js community had already found
it in a powerful CMS called Contentful.

## Contentful to the rescue

Contentful is both a Content-as-a-service (CaaS) provider as well as an
excellent headless Content Management System -- which in my opinion is what most
CMSs should be nowadays.

Instead of forcing you to render your content following a certain paradigm,
Contentful only provides you with the tools necessary to manage your content --
whatever that may be -- and expose it via HTTP endpoints.

All of that content is stored in their databases, which means that you don't
have to worry about maintaining or securing any server or database yourself.
Hooray!

<div style="width:100%;height:0;padding-bottom:75%;position:relative;"><iframe src="https://giphy.com/embed/aWRWTF27ilPzy" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div><p><a href="https://giphy.com/gifs/hooray-skeletor-aWRWTF27ilPzy">via GIPHY</a></p>

Of course, there's a little catch. As most "(blank)-as-a-service" providers out
there, Contentful is not always free. Although they have a very generous free
tier which, in my opinion, is more than adequate for most static sites, once you
go over that quota they will start charging you, so take that into consideration
before choosing a CMS.

In my particular case, I knew that Contentful was just exactly what I needed for
my blog and so I proceed to set up all my Content Types (Posts, Categories,
Tags, etc) and setup the Gatsby integration using the handy
[gatsby-source-contentful](https://www.npmjs.com/package/gatsby-source-contentful)
plugin that the Gatsby community created.

## Hosting with Netlify

The only key remaining decision I had to make was where to host my new blog,
which really wasn't a very difficult decision to make.
[Netlify](https://www.netlify.com/) is by far the best option out there when it
comes to hosting static sites, providing you with an amazing Continuous
Deployment infrastructure to generate and deploy static sites on demand, which
incidentally is perfect for this kind of architecture.

Just like Contentful, Netlify also has a very genereous free tier which is more
than enough for simple projects like this. If you ever need to scale, though,
they also offer several other tiers that can easily meet the demands of bigger
projects.

## Closing notes

And so it was that my quest for having a very cheap, secure, fast, scalable,
customizable and easy to maintain blog concluded. It's certainly not the most
exciting or well-looking blog out there, but it's everything I wanted it to be
-- both as a developer and as a blogger.

Personally I cannot wait to see how far can the limits of technologies like
Gatsby.js can be stretched, and with the advent and spread of new architectural
paradigms like Serverless, I predict it could be very far.

But whatever that limit is, I am quite sure that this is a step in the right
direction towards making the web a safer, faster and more enjoyable experience
for both developers and end-users.

<div style="width:100%;height:0;padding-bottom:52%;position:relative;"><iframe src="https://giphy.com/embed/12xSrwKxHxB3BS" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div><p><a href="https://giphy.com/gifs/black-and-white-end-ending-12xSrwKxHxB3BS">via GIPHY</a></p>
