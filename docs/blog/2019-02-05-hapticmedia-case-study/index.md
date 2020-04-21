---
title: "Beyond Static: Hapticmedia Uses Gatsby to Build a Dynamic Web App"
date: 2019-02-05
author: Linda Watkins
tags:
  - case-studies
  - apps
  - e-commerce
image: "images/hapticmedia.jpg"
showImageInArticle: true
---

[Hapticmedia](https://hapticmedia.fr/en/), a creator of 3D product configurators, has been at the cutting edge of retail and e-commerce for four years. But their existing website wasn’t the best showcase of their technological prowess. When the company started, they built their website with WordPress because that was easiest, and they had bigger things to worry about. But over time, the WordPress site became slow, difficult to update, and prone to breaking down. And as the company grew, they needed a site that could expand with them. Using Gatsby for their website rebuild meant greater stability, faster load times, and more scalability. They had initial concerns over whether a static site generator could successfully incorporate dynamic elements, but this proved not to be a problem.

## The Trouble with Troubleshooting

Nowadays, consumers want options, and they don’t want to sacrifice those options just because they’re shopping from their phones. This is where Hapticmedia comes in. Hapticmedia designs 3D configurators that allow customers to see exactly what they’re buying, even before they enter the store or put in an order.

They’ve been in business for four years, and for most of that time they had a WordPress site. But although this served them well early on, eventually it grew large and unwieldy, and that impacted page load times and stability. There were a lot of plug-ins and even making simple changes like editing or creating a single page would often break the site and necessitate extensive troubleshooting.

About a year ago, they got a large new client and signing this client got them more attention from other clients. Now they started worrying a bit more about the message their website was sending. They were a technology company, and having an older, out-of-date website that didn’t highlight the great work they do for clients reflected poorly on their brand.

## Dynamic Development with Gatsby

Cyril Bonnet, a UX engineer who had recently joined the company, was tasked with investigating alternative technologies and rebuilding the website. The number one priority was making a site that was a good reflection of the company and that created a positive user experience. This meant it needed to be an engaging, dynamic experience for the website visitor. But Bonnet was also thinking a few years ahead and didn’t want to end up with the same problems that had plagued the WordPress site, which meant the new site also needed to be simple and easy to maintain. He’s also intrigued by new technologies, and this was when a colleague suggested Gatsby. He investigated both Gatsby and competitors, and for Cyril, the main selling point was that Gatsby was built using a React codebase. Since Haptic already used React for its 3D work, going with Gatsby felt like a no-brainer.

Cyril wanted to include an example of dynamic elements on their site so that potential clients could see how it looked. They decided to add a 3D rotating image of a watch that could be customized for band-style and color as it rotated on all axes. There was some initial concern about using a static site generator for dynamic data, but when Cyril added the watch configurator to the site, he found that there was no problem. All he needed was to include some simple code to make sure that loading the watch app, which used a large external JS library, didn’t slow down the loading of the rest of the page.

According to Bonnet, “the 3D app integrated very well. And another dynamic element--a contact form created using Amazon’s web API--was also fairly simple to plug in. I was afraid Gatsby would just create static sites with no dynamic features, but that wasn’t the case at all.”

## 3D Interactivity, No Problem

The day they launched, the Hapticmedia team was immediately impressed by the fast page load times of the new site and the seamless page transitions due to Gatsby’s pre-fetching (which comes in Gatsby out-of-the-box). As the team scrolled down the page, they watched in Chrome Dev Tools as the subsequent pages loaded in the background. This pre-loading of pages meant there were no hiccups in page transitions and moving between pages was almost instantaneous.

<Pullquote>
  Every page loads before we click. It’s magic! No page transitions!
</Pullquote>

The interactive 3D rendering of a watch, showcasing Hapticmedia’s 3D configurator tools, also worked seamlessly. The user could interact with the image by rotating it 360 degrees, change the band style and color, and even push the buttons on the watch to see how the minute and second hands responded. It was exactly what Hapticmedia needed to showcase their 3D product configurator.

## Final Thoughts

Hapticmedia’s WordPress site served them well when they were smaller, but once their growth hit an inflection point, they needed a site that was both easy to maintain and which reflected the engaging, dynamic experiences they could build for their customers. After investigating the options, they chose Gatsby, with its React codebase that would offer the most power and versatility, as well as fit in best with their existing work. They found that Gatsby is much more than a static site generator. Gatsby is a great tool for building dynamic web apps, including managing dynamic data, user authentication, and more. The Hapticmedia website now blends dynamic and static elements, and it’s both stable and blazing fast.
