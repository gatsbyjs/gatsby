---
title: "Create a Deploy to Gatsby Cloud Button"
description: "Learn how to add a deploy button to your Github repository"
---

Gatsby Cloud supports Deploy Buttons which you can use to quickly create new sites from Github repositories.

[![Deploy to Gatsby Cloud](https://www.gatsbyjs.com/deploynow.svg)](https://www.gatsbyjs.com/dashboard/deploynow?url=https://github.com/gatsbyjs/gatsby-starter-blog)

At this time, only public Github repos are supported.

Have a feature request for Deploy Buttons? [Suggest a feature](https://gatsby.canny.io/gatsby-cloud).

### Configure a button

Set the `url` parameter of the link to your public Github repo.

HTML snippet:

```html
<a
  href="https://www.gatsbyjs.com/dashboard/deploynow?url=https://github.com/gatsbyjs/gatsby-starter-blog"
  target="_blank"
>
  <img
    src="https://www.gatsbyjs.com/deploynow.svg"
    alt="Deploy to Gatsby Cloud"
  />
</a>
```

Markdown:

```markdown
[![Deploy to Gatsby Cloud](https://www.gatsbyjs.com/deploynow.svg)](https://www.gatsbyjs.com/dashboard/deploynow?url=https://github.com/gatsbyjs/gatsby-starter-blog)
```
