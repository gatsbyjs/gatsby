---
title: Building Sites with Headless CMSs
date: "2018-02-03"
author: "Shannon Soper"
---

## What is a traditional CMS?

A traditional Content Management System (CMS)--like Wordpress, Drupal, Joomla, and many more--manages three things for a website: the content, admin screens, and presentation layer. These three things are tightly related, which is is good sometimes; for example, the team might be familiar with them, the website might already be running on them, there’s only one system to learn / one vendor relationship, and overall, there may be fewer choices to make.

You can think of a traditional CMS like an old home built by one person and with custom fittings. Gorgeous, and expensive to maintain, like the home in _The Money Pit_ (1986) with Tom Hanks and Shelley Long.

![Tom Hanks on a staircase that is falling apart](money-pit.jpeg)

Despite the advantages of this scenario, there are also some disadvantages which are listed below.

### Slower load times AND expensive

It is time-consuming and expensive to run a traditional CMS on edge servers (servers running CDNs) so they’re typically database-driven. This results in load times that become slower the farther away you live from the servers. For example, people often observe that US websites run slowly in Australia. This is because when someone in Australia accesses a US site built with a traditional CMS, it has to be sent from far-away servers.

### Hard to adapt to new formats

When content exists in a tight relationship with the presentation layer, adapting content for new formats like smart watches, kiosks, and virtual reality can be challenging and expensive.

## What is a headless CMS?

> "A headless CMS does nothing but manage content. It doesn’t deliver content to humans at all. Rather, it
> 'delivers' content to an application of some type. Its immediate consumer is code, and it’s assumed that
> code will reformat the content for final delivery to a human." - Deane Barker

A headless CMS only handles two things--content and admin screens--and the presentation layer (or “head”) must be handled separately. (Note: There are some variations on headless CMSs, like decoupled CMSs and use cases in which people only use the content management portion of a traditional CMS. Those topics can be left to others who have more expertise.)

A headless CMS allows content and the presentation layer technologies to become highly specialized and efficient, which would be similar to building a house with each part built by different companies, like the Jetson’s house here:

![The Jetson’s microwave shoots food at them and makes it so easy to eat!](the-jetsons.jpeg)

Here are some advantages to using a headless CMS in general.

### Faster load times AND cheaper?

With much less time (and therefore less money), you can set up a headless CMS with a delivery method like a static site generator or a progressive web app (PWA) and get your site running on edge servers.

The advantage of this method is a faster load time for most sites, which can be illustrated by the previous Australia example. Let’s say a person in Australia accesses a US site built with a headless CMS and static site generator; the site can run off of a closer server, so it will load quickly. This is an enormous advantage for both the user and for whomever created the site.

Fast load times can be taken to the next level with sites that run offline. I recently chatted with a friend in New Delhi who built his blog to run offline, which is an incredible advantage for commuters who want to read his blog while on public transportation with spotty internet access. This whole setup is easier to accomplish with a headless CMS and static site generator.

### Higher quality AND cheaper?

Headless CMSs perform well in scenarios in which a traditional CMS would prove inadequate and I’d like to point to Deane Barker’s [excellent article on use cases for headless CMSs](https://gadgetopia.com/post/9743). Here is a partial list of use cases adapted from his list:

You need to gather content from disparate places and pull it together into one platform
You need to push content to various formats, including desktop sites, mobile sites, smart watches, ads, etc.
Your developers dislike traditional CMSs, yet the editors and marketing folks prefer to add, edit, and delete content in a familiar editing environment
You keep a traditional CMS and yet want to add a simpler/cheaper/more structured method for particular projects, types of content, or a specific group of editors
All of the above! :)

### What is the editing experience like in a headless CMS?

Most headless CMSs require you to create a structure for your content and then enter content into that structure. Parts of the content structure typically are called “content models.” Content can include words, images, URLs, lists, etc. Then, outside of the CMS, you use push this content through a presentation layer (GraphQL queries are one way to do this pushing).

## Which headless CMS should I choose?

Whether or not you’re convinced that a headless CMS is a good idea, the next step would be to try it out for yourself. I found this handy site with a [list of headless CMSs to keep an eye on](https://headlesscms.org/about/).

And here’s what I learned from testing several popular CMSs for five minutes each. (Background: I’m a writer and content editor who knows just enough about developing to get myself in major trouble, very quickly.)

### GraphCMS

This has a great API explorer (built-in GraphiQL) and their left hand side bar and onboarding process was quick and easy-to-understand. I pretty much understand what web hooks are now, after 30 seconds of going through their tutorial. Very cool. Not totally sure I get a concept called “enumerations” and the names for different kinds of permissions. The one called “create” was confusing because “create” is also a verb, so I expected something to happen when I clicked that button, but nothing happened. I suspect it is the name of one of the roles with different sets of permissions.

### ButterCMS

This one has more basic design than GraphCMS. My favorite thing here is a super easy way to add Metadata and SEO title / metadescription to blog posts. I've read that ButterCMS is particularly good for blogs, and now it makes sense why this might be the case. Sometimes the flow is a bit clunky with a few more clicks than necessary. when saving things because I’d expect it to take me back to the object, but I have to click a button to go back. Sometimes the jargon in this environment throws me off. Like “object”? What is that? It’s basically a category of content. So if I’m going to create a lot of event descriptions, the event titles will be one object, the event description another object, etc.

### Built.io (Contentstack)

I filled out a form to get a free trial and heard back a while later with some questions about the purpose of my trial site and when I expect to go live, where I work, etc. It felt like a bit too much information to provide for a free trial, so I didn’t respond.

### Contentful

I already built this site http://watson.surge.sh/ with Contentful and talk about that experience [here](./building-a-site-with-react-and-contentful/). Another thing I like about Contentful, which I didn't mention in the other article, is how smooth it is to toggle between content models. They recently sent an update about their tool that says you can add images inline in chunks of text, which makes the editing experience feel more like using a WYSIWYG.

### CloudCMS

This system gives you lots of options when it comes to creating content. Maybe too many options. For example, the free trial account comes preloaded with a sample project that had book information. It looks like it’s possible to interact with each book description by making it multilingual, downloading it, saving it to favorites, and the list goes on so long, I couldn’t keep track of all they ways to interact with content. These choices seem useful and overwhelming. Otherwise, this system has pixelated graphics and a workflow that was hard to navigate as an editor of content; it felt more like a series of rabbit holes instead of a flow.

## Conclusion

If you’ve been able to make it this far, you have heard me complain about the jargon of headless CMSs and also talk about some use cases. I’d definitely choose a headless CMS over a traditional CMS if I had talented front-end developers, because they could choose their favorite framework for the presentation layer. That kind of flexibility would also allow us to switch delivery methods and content management methods with more agility.

Happy headless hunting! Headless horseman. Oh no, analogies are running away from me, like chickens with their heads cut off...
