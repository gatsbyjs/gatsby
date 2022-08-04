---
title: Gatsby Starters
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

Alternatively, you can also supply a GitHub username and repository:

```shell
gatsby new [SITE_DIRECTORY] [GITHUB_USER_NAME/REPO]
```

Here is an example with the `[GITHUB_USER_NAME/REPO]` format:

```shell
gatsby new blog gatsbyjs/gatsby-starter-blog
```

This also downloads the files and initializes the site by running `npm install`.

If you don't specify a custom starter, your site will be created from the [default starter](https://github.com/gatsbyjs/gatsby-starter-default).

> **Note:** If you work for an Enterprise-level company where you are unable to pull from public GitHub repositories, you can still set up Gatsby. Check out the [docs to learn more](/docs/using-gatsby-professionally/setting-up-gatsby-without-gatsby-new/).

### Using a local starter

Another option is to supply a path (relative or absolute) to a local folder containing a starter:

```shell
gatsby new [SITE_DIRECTORY] [LOCAL_PATH_TO_STARTER]
```

Here is an example assuming a starter exists on the path `./Code/my-local-starter`:

```shell
gatsby new blog ./Code/my-local-starter
```

## Official starters

Official starters are maintained by Gatsby.

| Starter                                                                                              | Demo/Docs                                                  | Use case                               | Features                     |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------- | ---------------------------- |
| [gatsby-starter-default](https://github.com/gatsbyjs/gatsby-starter-default)                         | [Demo](https://gatsbystarterdefaultsource.gatsbyjs.io/)    | Appropriate for most use cases         | General Gatsby site          |
| [gatsby-starter-blog](https://github.com/gatsbyjs/gatsby-starter-blog)                               | [Demo](https://gatsbystarterblogsource.gatsbyjs.io/)       | Create a basic blog                    | Blog post pages and listings |
| [gatsby-starter-hello-world](https://github.com/gatsbyjs/gatsby-starter-hello-world)                 | [Demo](https://gatsbystarterhelloworldsource.gatsbyjs.io/) | Learn Gatsby                           | Gatsby bare essentials       |
| [gatsby-starter-blog-theme](https://github.com/gatsbyjs/gatsby-starter-blog-theme)                   | [Docs](/docs/themes/)                                      | Blog posts and pages                   | Gatsby themes                |
| [gatsby-starter-theme-workspace](https://github.com/gatsbyjs/gatsby-starter-theme-workspace)         | [Docs](/docs/how-to/plugins-and-themes/building-themes/)   | Building Gatsby Themes                 | Minimal theme workspace      |
| [gatsby-starter-rendering-modes](https://github.com/gatsbyjs/gatsby-starter-rendering-modes)         | [Demo](https://gatsbystarterrenderingmodes.gatsbyjs.io/)   | Learn different rendering modes        | DSG and SSR                  |
| [gatsby-starter-shopify](https://github.com/gatsbyjs/gatsby-starter-shopify)                         | [Demo](https://shopify-demo.gatsbyjs.com/)                 | E-commerce                             | Shopify integration          |
| [gatsby-starter-wordpress-blog](https://github.com/gatsbyjs/gatsby-starter-wordpress-blog)           | [Demo](https://gatsbystarterwpblog.gatsbyjs.io/)           | WordPress blog post pages and listings | WordPress integration        |
| [gatsby-starter-landing-page](https://github.com/gatsbyjs/gatsby-starter-landing-page)               | [Demo](https://landingpagestarter.gatsbyjs.io/)            | Dynamic marketing landing pages        | Contentful integration       |
| [gatsby-starter-homepage-contentful](https://github.com/gatsbyjs/gatsby-starter-contentful-homepage) | [Demo](https://gatsbycontentfulhomepage.gatsbyjs.io/)      | Homepage template                      | Contentful integration       |
| [gatsby-starter-homepage-wordpress](https://github.com/gatsbyjs/gatsby-starter-wordpress-homepage)   | [Demo](https://gatsbywordpresshomepage.gatsbyjs.io/)       | Homepage template                      | WordPress integration        |
| [gatsby-starter-homepage-drupal](https://github.com/gatsbyjs/gatsby-starter-drupal-homepage)         | [Demo](https://gatsbydrupalhomepage.gatsbyjs.io/)          | Homepage template                      | Drupal integration           |
| [gatsby-starter-homepage-datocms](https://github.com/gatsbyjs/gatsby-starter-datocms-homepage)       | [Demo](https://gatsbydatocmshomepage.gatsbyjs.io/)         | Homepage template                      | DatoCMS integration          |
| [gatsby-starter-homepage-sanity](https://github.com/gatsbyjs/gatsby-starter-sanity-homepage)         | [Demo](https://gatsbystartersanityhomepage.gatsbyjs.io/)   | Homepage template                      | Sanity integration           |

## Modifying starters

Learn [how to modify a starter](/docs/modifying-a-starter/) in the Gatsby docs. You can use official and community starters out of the box but you may want to customize their style and functionality.

## Making starters

Learn [how to make a starter](/docs/creating-a-starter/) in the Gatsby docs. Starters can be created for your team(s) only or distributed to the broader community. It's up to you!

## Community starters

Community starters are created and maintained by Gatsby community members.

- Looking for a starter for a particular use case? Browse starters that have been submitted to the [Starter Library](/starters/#Community).
- Have you built your own starter? [Submit it](/starters/submissions) for review to share it with the community by having it featured in the Gatsby Starter Library.
