---
title: My search for the perfect universal JavaScript framework
date: "2017-10-29"
author: "Tal Bereznitskey"
---

It was 2010 when [Backbone.js](http://backbonejs.org) came out. Finally I could
write structured code to create full web applications for our users. And with
Backbone.js and Node.js, a new dream started to emerge, a website that starts
rendering on the server side and continues to render on the users’ browsers.

I spent days and nights trying to build a generic isomorphic web framework that
starts with server side rendering (SSR) and then continues work in the browser.
It was difficult to design and I could only make it meet the use case of my
company—with lots of small hacks to get the job done. Airbnb made a shot at
building such a framework as well with
[rendr](https://github.com/rendrjs/rendr). It was the closest thing to a
Backbone.js isomorphic web framework, but it didn’t support the full features of
Backbone.

[React](https://reactjs.org) was the game changer. It was better suited to
building universal apps since its core idea is mapping state to DOM, or in the
server rendering case, state to an HTML string. But still, making React render
on the server side and then rehydrating it on the client side includes solving
many edge cases, messy configuration, and cryptic knowledge of Babel and
webpack.

So universal web apps are great but hard. And even when you do get universal
React working, SSR can be super slow and CPU intensive so it’ll often hog the
Node.js event loop. Even after lots of optimizing, our team's ultimate solution
is always caching.

But why dynamically rendered content just to cache it when you can just
pre-cache everything? AKA static websites?

This is what Gatsby enables. It makes it trivial to build React websites as
pre-cached/built static websites.

I love static websites. That's how we all started building websites, right? For
me it was an online editor of
[GeoCities](https://en.wikipedia.org/wiki/Yahoo!_GeoCities) and that was all we
needed back then. Why not go back to static websites? They are fast, scalable,
secure and eliminate time consuming devops work.

Static websites aren't a great fit for everything. Full webapps behind login can
be fully rendered on the client side so see small benefit from static rendering
since each visit is personalized. Serving a statically rendered “shell” for the
website could help with perceived performance, but… let’s get back to talking
about static websites and leave discussing web apps for another time.

Sprinkling JavaScript on a static website can be tricky, but Gatsby does this so
well with React that you don't have to think about it at all—it just works. I
used to tweak my configuration all the time to achieve better performance, but
Gatsby allows me to outsource the configuration and optimization and get a super
fast website with zero work.

I’ll also mention [next.js](https://github.com/zeit/next.js) which is quite
similar and supports both SSR for dynamic content and exporting to static pages.
And don't forget [Netlify](https://www.netlify.com) who is doing an amazing job
at building and hosting static websites.

It is so much easier and fun to code for the web today. I would haved saved a
lot of development/devops hours at my previous startup just by using Gatsby. And
the most fun fact about Gatsby is these aren’t modern ideas at all - it's just
static websites done right.

This post is based on a
[tweetstorm](https://twitter.com/ketacode/status/924243146795515904) - find me
on Twitter [@ketacode](https://twitter.com/ketacode)
