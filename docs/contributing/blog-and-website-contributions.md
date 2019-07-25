---
title: Blog & Website Contributions
---

We wholeheartedly welcome contributions to the Gatsby blog and website!

Here are some things to keep in mind when deciding where to contribute to Gatsby:

- [Blog posts](#contributing-to-the-blog) work best for case studies and time-sensitive storytelling (see the [blog post format](#blog-post-format)).
- [Docs](/contributing/docs-contributions/) are continually relevant and discoverable learning materials that go beyond any one case study or situation.
- [Website changes](#making-changes-to-the-website) that improve either of these are always welcome!

## Contributing to the blog

Note: Before adding a blog post, ensure you have approval from a member of the Gatsby team. You can do this by [opening an issue](https://github.com/gatsbyjs/gatsby/issues/new/choose) or contacting [@gatsbyjs on Twitter](https://twitter.com/gatsbyjs).

To add a new blog post to the gatsbyjs.org blog:

- Clone [the Gatsby repo](https://github.com/gatsbyjs/gatsby/) and navigate to `/www`.
- Run `yarn` to install all of the website's dependencies. ([Why Yarn?](/contributing/setting-up-your-local-dev-environment#using-yarn))
- Run `npm run develop` to preview the blog at `http://localhost:8000/blog`.
- The content for the blog lives in the `/docs/blog` folder. Make additions or modifications here.
- Add your avatar image to `/docs/blog/avatars`.
- Add your name to `/docs/blog/author.yaml`.
- Add a new folder following the pattern `/docs/blog/yyyy-mm-dd-title`. Within this newly created folder, add an `index.md` file.
- Add `title`, `date`, `author`, `excerpt`, and `tags` ([view existing tags](/blog/tags/) or add a new one) to the frontmatter of your `index.md`. If you are cross posting your post, you can add `canonicalLink` for SEO benefits. You can check the other blog posts in `/docs/blog` for examples.
- If your blog post contains images, add them to your blog post folder and reference them in your post's `index.md`.
- Ensure any links to gatsbyjs.org are relative links - `/contributing/how-to-contribute/` instead of `https://gatsbyjs.org/contributing/how-to-contribute`.
- Follow the [Style Guide](/contributing/gatsby-style-guide/#word-choice) to make sure you're using the appropriate wording.
- Double check your grammar and capitalize correctly.
- Commit and push to your fork.
- Create a pull request from your branch.
  - We recommend using a prefix of `docs`, e.g. `docs/your-change` or `docs-your-change`. ([PR example](https://github.com/gatsbyjs/gatsby/commit/9c21394add7906974dcfd22ad5dc1351a99d7ceb#diff-bf544fce773d8a5381f64c37d48d9f12))

### Blog post format

The following format can help you in creating your new blog content. At the top is "frontmatter": a fancy name for metadata in Markdown. The frontmatter for your post should include a title, date, singular author name (for now, we would welcome issues/PRs for this), and one or more tags. Your content will follow after the second set of dashes (`---`).

```md
---
title: "Your Great Blog Post"
date: YYYY-MM-DD
author: Jamie Doe
excerpt: "Here is a helpful excerpt or brief description of this blog post."
tags:
  - awesome
  - post
---

Your next great blog post awaits!

Include images by creating a folder for your post and including
Markdown and image files for easy linking.

![awesome example](./image.jpg)
```

## Making changes to the website

If you want to make changes, improvements, or add new functionality to the website, you don't have to set up the full Gatsby repo to contribute. You can spin up your own instance of the Gatsby website with these steps:

- Clone [the Gatsby repo](https://github.com/gatsbyjs/gatsby/) and navigate to `/www`
- Run `yarn` to install all of the website's dependencies.
- Run `npm run develop` to preview the site at `http://localhost:8000/`.

> Note: If you are experiencing issues on a Linux machine, run `sudo apt install libvips-dev`, to install a native dependency. You can also reference [Gatsby guide on Linux](/docs/gatsby-on-linux/) for other Linux-specific requirements.

Now you can make and preview your changes before raising a pull request!

For full repo setup instructions, visit the [code contributions](/contributing/code-contributions/) page.
