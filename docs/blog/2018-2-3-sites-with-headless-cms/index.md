---
title: Building Sites with Headless CMSs
date: "2018-02-03"
author: "Shannon Soper"
---

## What is a traditional CMS?

A traditional Content Management System (CMS)--like Wordpress, Drupal, or Joomla--manages three things for a website: content, admin screens, and presentation layer. These three things are tightly integrated, which has advantages. For example, there’s only one system to learn / one vendor relationship, and overall, there may be fewer choices to make. In addition, traditional CMSs have been around for so long that many teams are familiar with them and many websites are already be running on them. Both advantages.

You can think of a traditional CMS like an old home built by one person and with custom fittings. Gorgeous, and expensive to maintain, like the home in _The Money Pit_ (1986) with Tom Hanks and Shelley Long.

![Tom Hanks on a staircase that is falling apart](money-pit-2.jpeg)

Despite the advantages of this scenario, there are also some disadvantages which are listed below.

### Slower load times AND expensive

Most traditional CMSs can't run on [edge servers](https://www.cloudflare.com/learning/cdn/glossary/edge-server/) (servers running CDNs). This results in slower load times the farther away you live from the servers. For example, people often observe that US websites run slowly in Australia. This is not imaginary; when someone in Australia accesses a US site built with a traditional CMS, it has to be sent from far-away servers.

### Hard to adapt content to new formats

When content exists in a tight relationship with the presentation layer, adapting that content for new formats like smart watches, kiosks, and virtual reality can be challenging and expensive.

## What is a headless CMS?

> "A headless CMS does nothing but manage content. It doesn’t deliver content to humans at all. Rather, it
> 'delivers' content to an application of some type. Its immediate consumer is code, and it’s assumed that
> code will reformat the content for final delivery to a human." - Deane Barker

To add to Deane Barker's eloquent explanation in the quote above (see his article [here](https://gadgetopia.com/post/9743)), a headless CMS only handles two things--content and managing that content through admin screens. This means that a separate presentation layer (or “head”) like GatsbyJS must reformat the content for delivery to a CDN and then final delivery to humans.

_Note on how CMSs usually work:_ Most headless CMSs require you to create various structures for your content, typically called "content models", and then enter content into that structure. Content can include words, images, URLs, lists, etc. Then, outside of the CMS, you push this content through a presentation layer (GraphQL queries are one way to do this pushing).

Following are some advantages to using a headless CMS.

### Faster load times AND cheaper?

With much less time (and therefore less money), you can set up a headless CMS with a presentation layer like GatsbyJS and a CDN and get your site running on edge servers.

Besides being faster and therefore less expensive to set up, this method also produces faster load times for most sites. Let’s say a person in Australia accesses a US site built with a headless CMS and GatsbyJS; the site can run off of a closer server, so it will load quickly. This is an enormous advantage for both the user and for whomever created the site.

Faster load times can be taken to the next level with sites that run offline. I recently chatted with a friend in New Delhi who used GatsbyJS to build his blog to run offline, which is an incredible advantage for commuters who want to read while on public transportation with spotty internet access.

### Higher quality AND cheaper?

The separation between a headless CMS and the presentation layer allows both to become highly specialized and efficient, similar to the food production system in the Jetson’s house:

![The Jetson’s microwave shoots food at them and makes it so easy to eat!](the-jetsons.jpeg)

When businesses specialize in one thing instead of several, they tend to become more time-efficient and can produce things at a lower cost. In human terms, this means that headless CMSs tend to cost you less than traditional CMSs, because they cost less up front or they take you less time to maintain.

This specialization also means that headless CMSs perform well in scenarios in which a traditional CMS would prove inadequate. I’d like to point to Deane Barker’s [excellent article on use cases for headless CMSs](https://gadgetopia.com/post/9743), from which we've extracted a partial list:

* You need to gather content from disparate places and pull it together into one platform
* You need to push content to various formats, including desktop sites, mobile sites, smart watches, ads, etc.
* Your developers dislike traditional CMSs, yet the editors and marketing folks prefer to add, edit, and delete content in a familiar editing environment
* You keep a traditional CMS and yet want to add a simpler/cheaper/more structured method for particular projects, types of content, or a specific group of editors
* All of the above! :)

In all of these cases, a headless CMS is an excellent solution for you.

## Which headless CMS should I choose?

Whether or not you’re convinced that a headless CMS is a good idea, the next step would be to try some out for yourself. I found this handy site with a [list of headless CMSs to keep an eye on](https://headlesscms.org/about/).

And here’s what I learned from testing several popular CMSs for five minutes each. (Background: I’m a writer and content editor who knows just enough about developing to get myself into major trouble :)

### GraphCMS

Their sleek design impressed me: the left hand side bar and onboarding process was quick and easy-to-understand. For example, I pretty much understand what web hooks are now, after 30 seconds of going through their tutorial. Very cool. Also, very excited to see their handy API explorer (built-in GraphiQL)! Not totally sure I get the concept called “enumerations” and the names for different kinds of permissions. The one called “create” was confusing because “create” is also a verb, so I expected something to happen when I clicked that button, but nothing happened. I suspect it is the name of one of the roles.

### ButterCMS

I've read that ButterCMS is particularly good for blogs, and after seeing how easy it is to add metadata and SEO title / metadescription to blog posts, it makes sense why this might be the case. Sometimes there were more clicks than necessary when saving things. And sometimes the jargon in this environment threw me off. Like “object”? What is that? It’s basically a category of content. So, if I’m going to create a lot of event descriptions, the event titles will be one object, the event description, another object, etc. It's an unfamiliar and abstract word for someone new to headless CMSs.

### Built.io (Contentstack)

I filled out a form to get a free trial and heard back a while later with some questions about the purpose of my trial site, when I expect to go live, where I work, etc. It felt like a bit too much information to provide for a free trial, so I didn’t respond.

### Contentful

I already built this site http://watson.surge.sh/ with Contentful and talk about that experience [here](/blog/2018-1-25-building-a-site-with-react-and-contentful/). Another thing I like about Contentful, which I didn't mention in the other article, is how smooth it is to toggle between content models (categories of content types). Their recent product update says you can add images inline in chunks of text, which makes the editing experience feel more like using a WYSIWYG. This seems like it would make things easy on the editing side, although I haven't explored if this would affect image presentation.

### CloudCMS

This system gives you lots of options when it comes to creating content. Maybe too many options. For example, the free trial account comes preloaded with a sample project. When I clicked on a sample book description, there was a list of about 12 hyperlinks and because of the sheer number of choices, and the fact that I'm unfamiliar with their terminology, I felt overwhelmed. Otherwise, this system has pixelated graphics and a workflow that was hard to navigate as an editor of content; it felt more like a series of rabbit holes instead of a flow. On the upside, some of the capabilities seem really useful, like a button that said "make it multilingual." Could it be that easy?

## Conclusion

I’d definitely choose a headless CMS over a traditional CMS if I had talented front-end developers, because they could choose their favorite framework for the presentation layer. That setup would give us the flexibility to switch delivery methods, presentation methods, and content management methods with agility.
