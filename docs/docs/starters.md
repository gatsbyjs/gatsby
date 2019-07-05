---
title: "Gatsby Starters"
---

The Gatsby CLI tool lets you install **starters**, which are boilerplate Gatsby sites maintained by the community and intended for jump-starting development quickly.

## Installing starters

Execute the `gatsby new` command to clone a boilerplate starter, install its dependencies, and clear Git history.

### Using Git repo URLs

When creating a new Gatsby site, you can optionally specify a starter to base your new site on; they can come from any publicly available Git repo, such as GitHub, GitLab, or Bitbucket. You can supply the `[URL_OF_STARTER_GIT_REPO]` directly:

```shell
gatsby new [SITE_DIRECTORY] [URL_OF_STARTER_GIT_REPO]
```

For example, to create a site in a `blog` directory with Gatsby Starter Blog from its GitHub URL:

```shell
gatsby new blog https://github.com/gatsbyjs/gatsby-starter-blog
```

This downloads the files and initializes the site by running `npm install`.

### Using GitHub usernames and repos instead of URLs

Alternatively, you can also supply a GitHub user name and repository:

```shell
gatsby new [SITE_DIRECTORY] [GITHUB_USER_NAME/REPO]
```

Here is an example with the `[GITHUB_USER_NAME/REPO]` format:

```shell
gatsby new blog gatsbyjs/gatsby-starter-blog
```

This also downloads the files and initializes the site by running `npm install`.

If you don't specify a custom starter, your site will be created from the [default starter](https://github.com/gatsbyjs/gatsby-starter-default).

> **Note:** If you work for an Enterprise-level company where you are unable to pull from public GitHub repositories, you can still set up Gatsby. Check out the [docs to learn more](/docs/setting-up-gatsby-without-gatsby-new/).

## Official starters

Official starters are maintained by Gatsby.

| Starter                                                                              | Demo                                                         | Use case                       | Features                     |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------ | ---------------------------- |
| [gatsby-starter-default](https://github.com/gatsbyjs/gatsby-starter-default)         | [Demo](https://gatsby-starter-default-demo.netlify.com/)     | Appropriate for most use cases | General Gatsby site          |
| [gatsby-starter-blog](https://github.com/gatsbyjs/gatsby-starter-blog)               | [Demo](https://gatsby-starter-blog-demo.netlify.com/)        | Create a basic blog            | Blog post pages and listings |
| [gatsby-starter-hello-world](https://github.com/gatsbyjs/gatsby-starter-hello-world) | [Demo](https://gatsby-starter-hello-world-demo.netlify.com/) | Learn Gatsby                   | Gatsby bare essentials       |

## Making starters

Learn [how to make a starter](/docs/creating-a-starter/) in the Gatsby docs. Starters can be created for your team(s) only or distributed to the broader community. It's up to you!

## Community starters

Community starters are created and maintained by Gatsby community members.

- Looking for a starter for a particular use case? Browse starters that have been submitted to the [Starter Library](/starters/).
- Created a starter you'd like to share? Follow [these steps to submit your starter](/contributing/submit-to-starter-library/) to the Starter Library.
