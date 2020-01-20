---
title: Sourcing Content and Data
---

A core feature of Gatsby is its ability to **load data from anywhere**. This is part of what makes Gatsby more powerful than static site generators that are limited to only loading content from Markdown files.

A core benefit of this “data from anywhere” approach is that it allows teams to manage their content in nearly any [backend](/docs/glossary/#backend) they prefer.

Gatsby uses source plugins to pull in data. [Numerous source plugins already exist](/plugins/?=gatsby-source) for pulling in data from other APIs, CMSs, and databases. Each plugin fetches data from their source, meaning the filesystem source plugin knows how to fetch data from the file system, the WordPress plugin knows how to fetch data from the WordPress API, etc. By including multiple source plugins, you can fetch data and combine it all in one data layer.

Bonus: read about [Gatsby themes and distributed docs](/blog/2019-07-03-using-themes-for-distributed-docs/) working well together on the Gatsby blog.

_(If there isn’t a plugin yet for your favorite option, consider [contributing](/docs/creating-plugins) one!)_

<GuideList slug={props.slug} />
