---
title: "Gatsby Days Video: Building an Encrypted PWA with Gatsby + Userbase"
date: 2020-07-20
author: Michelle Gienow
excerpt: "After learning that many existing menstrual cycle tracker apps were sharing user data with third parties, Benedicte Raae decided to build her own. In her Gatsby Days Reconfigured presentation, the co-founder and senior developer of Lilly Labs, shows how to build a secure progressive web app with Gatsby and Userbase for end to end encryption."
tags:
  - security
  - gatsby-days
---

Co-founder, Senior Developer, and Mom of Lilly Labs Benedicte Raae decided to make her own encrypted menstrual cycle app after learning that some of the cycle tracker apps on the market were sharing user data with third parties. Since even the “good” apps still left user data at least somewhat accessible -- to the product developers for example -- Benedicte wanted to make an app where even she, as creator, wouldn’t be able to view her users’ highly personal data.

Benedicte decided that the best approach to building [POW!, the menstrual tracker app](https://www.usepow.app/) she ultimately launched, would be to offload the encryption work to a backend-as-a-service. She chose Userbase since all data would be end to end encrypted and protected by a unique security key (no password to hack). She also chose Gatsby because she had really liked using it for other projects and also wanted to build POW! as a progressive web app -- according to her, Gatsby is the best framework for PWAs. Watch Benedicte’s Gatsby Days Reconfigured video to see how to build a Gatsby site with user authentication and then wire it up to Userbase.

https://www.youtube.com/watch?v=kKp7Syxyxnw

The [code for her demo](https://github.com/raae/gatsby-userbase-ugliest-app) is available on GitHub. Follow Benedicte on Twitter [@Raae](https://twitter.com/raae) and check out her [new YouTube channel](https://www.youtube.com/channel/UCDlrzlRdM1vGr8nO708KFmQ) for more videos about making and learning cool new stuff!
