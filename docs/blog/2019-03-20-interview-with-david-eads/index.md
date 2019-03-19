---
title: Interview With David Eads
date: 2019-03-20T04:00:00+00:00
author: Sam Bhagwat
tags:
  - david eads
  - react
image: ""
showImageInArticle: false
---

I recently sat down with David Eads, who recently wrote a fascinating deep dive ([https://www.propublica.org/nerds/the-ticket-trap-news-app-front-to-back-david-eads-propublica-illinois](https://www.propublica.org/nerds/the-ticket-trap-news-app-front-to-back-david-eads-propublica-illinois "https://www.propublica.org/nerds/the-ticket-trap-news-app-front-to-back-david-eads-propublica-illinois")) about how he used Gatsby for ProPublica's Ticket Trap data visualization. David and I talked about what he's used Gatsby for and why.

**Sam:** You've used Gatsby extensively to create a number of data visualization projects that are really interesting from both a technical and a journalistic perspective. Could you talk a little about what you've built with Gatsby and what you're most proud of

**David:** Everything I've made since 2018 has been in Gatsby. [https://projects.propublica.org/graphics/il/stuck-kids/](https://projects.propublica.org/graphics/il/stuck-kids/ "https://projects.propublica.org/graphics/il/stuck-kids/") is one example,[ ](https://projects.propublica.org/chicago-tickets/)[https://projects.propublica.org/chicago-tickets/](https://projects.propublica.org/chicago-tickets/ "https://projects.propublica.org/chicago-tickets/") is another. I've also done embedded graphics with Gatsby, like the one seen here[ ](https://features.propublica.org/the-bad-bet/how-illinois-bet-on-video-gambling-and-lost/)[https://features.propublica.org/the-bad-bet/how-illinois-bet-on-video-gambling-and-lost/](https://features.propublica.org/the-bad-bet/how-illinois-bet-on-video-gambling-and-lost/ "https://features.propublica.org/the-bad-bet/how-illinois-bet-on-video-gambling-and-lost/")

> ProPublica Illinois
>
> [Every day, a child is held beyond medical necessity in Illinois.](https://projects.propublica.org/graphics/il/stuck-kids/)
>
> They've been cleared to leave, but there's no where for them to go. Explore the cases of Illinois youths stuck in psychiatric hospitals because of failures within the state'a Department of Children and Family Services.

![](https://lh6.googleusercontent.com/dRNWncDA0kozSi8fYWR8GvvW-x3zIbYakZM8Nzn7w8LvAC6j-WXuQMs6uClrGoxNX4GQZBpaS0_dKcsKR-IPoDG5lnQypyZ931IZTDlXVTW1zZk34hwn_Nx8icXgSvnS95wltPtv =400x211)

> ProPublica Illinois
>
> [The Ticket Trap: Where Chicago Issues Parking Tickets and Who Pays...](https://projects.propublica.org/chicago-tickets/)
>
> The city of Chicago has generated billions of dollars in revenue from parking tickets while sending low-income and black communities into debt. Search our interactive database of 54 million tickets issued since 1996 — and learn how your ward stacks up.

![](https://lh6.googleusercontent.com/5bJ08kbwn6FXjwYCSC9Oa77g9HF6K512zCmfj4Q414u5JjvlGo2rt4rzXLyY_ZpYlNskekd59d5WuiILBuF005X5Nf5kjwCjuarOqrjYgP_0JM3dVzKaNw2NZY7vrCEVaWwL2eKp =400x211)

> ProPublica
>
> [Illinois Bet on Video Gambling — and Lost](https://features.propublica.org/the-bad-bet/how-illinois-bet-on-video-gambling-and-lost/)
>
> Legalizing video poker and slots was supposed to generate billions of dollars for the state. A decade later, that hasn’t happened. Now, legislators want to double down on gambling.

![](https://lh6.googleusercontent.com/kjNdyGtMJArAcsze0hkbzWwTGQxky7vOqhii3By0YQ-EW_jM7Uqz9DKNjzFruiDo6uvZSJld2dlt7nLSi2pEoTDoKI1opEuPUgnBY93kgsiIERuv2afYwQ9Jp1azjNoQU3yzjYtF =400x211)

We've used it to simply embed responsive content in stories but also to build full-blown news applications.

**Sam:** Can you talk a bit about the benefit of using Gatsby specifically in a news organization?

**David:** The benefits that I've found are 1) the general maintainability of static apps (which can be built with all kinds of tools and are critical to sustainable newsroom infrastructure), 2) the consolidated query system, which is very important for journalistic work where data can come from many sources such as Google Sheets used to keep track of small bits of text or translations, massive databases, CSV files, and practically anything else you can think of, and 3) the speed of the built sites. Getting content onto people's screens is of utmost importance in journalism, and Gatsby does a good job with that.

The dependence on React has been a barrier to wider adoption within ProPublica -- rightfully, not everyone wants to be tied to React. But ProPublica Illinois has seen a lot of benefit from it.
