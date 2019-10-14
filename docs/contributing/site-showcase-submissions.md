---
title: Submit to Site Showcase
---

Want to submit a site to the [Site Showcase](/showcase/)? Follow these instructions.

## Steps

There are three major steps:

1.  If this is your first contribution to the Gatsby open source repo, follow the [Contribution guidelines](/contributing/code-contributions/).

2.  If there is a chance that someone else could have already submitted the site, please make sure no one else has already submitted it by searching existing PRs: https://github.com/gatsbyjs/gatsby/pulls

3.  Edit the [`sites.yml`](https://github.com/gatsbyjs/gatsby/blob/master/docs/sites.yml) file by adding your submission to the bottom of the list of sites in the following format:

```yaml:title=docs/sites.yml
- title: Title of the Site

  # this is the URL that is linked from the showcase
  main_url: https://titleofthesite.com

  # this URL is used to generate a screenshot
  url: https://titleofthesite.com/portfolio

  # optional: for open-source sites, this URL points to the repo that powers the site
  source_url: https://github.com/{username}/{titleofthesite}

  # optional: short paragraph describing the content and/or purpose of the site that will appear in the modal detail view and permalink views for your site
  description: >
    {titleofthesite} is a shiny new website built with Gatsby v2 that makes important contributions towards a faster web for everyone.

  # You can list as many categories as you want here. Check list of Categories below in this doc!
  # If you'd like to create a new category, simply list it here.
  categories:
    - Relevant category 1
    - Relevant category 2

  # Add the name (developer or company) and URL (e.g. Twitter, GitHub, portfolio) to be used for attribution
  built_by: Jane Q. Developer
  built_by_url: https://example.org

  # leave as false, the Gatsby site review board will choose featured sites quarterly
  featured: false
```

Use the following template to ensure required fields are filled:

```yaml:title=docs/sites.yml
- title: (required)
  url: (required)
  main_url: (required)
  source_url: (optional - https://github.com/{username}/{titleofthesite})
  description: >
    (optional)
  categories:
    - (required)
  built_by: (optional)
  built_by_url: (optional)
  featured: false
```

## Helpful information

### Categories

Categories currently include both _type of site_ (structure) and the _content of the site_. You will place all these under "categories" in your submission for now. The reason these are in two separate lists here is to show that you can have a school's marketing site (type of site would be marketing, and content would be education) or a site that delivers online learning about marketing (type of site would be education and content would be marketing).

#### Type of site

- Blog
- Directory
- Documentation
- eCommerce
- Education
- Portfolio
- Gallery
- See [`categories.yml`](https://github.com/gatsbyjs/gatsby/blob/master/docs/categories.yml) for an up to date list of valid categories.

#### Content of site

A few notes on site content: a common question is this: "aren't all Gatsby sites technically in the "web development" category?" Well, no because this category means the _content_ of the site has to be about web development, like [ReactJS](https://reactjs.org/). Also, the difference between technology and web development is like this. [Cardiogram](https://cardiogr.am/) is technology, while [ReactJS](https://reactjs.org/) is web development.

- Agency
- Education
- Entertainment
- Finance
- Food
- Healthcare
- Government
- Marketing
- Music
- Media
- Nonprofit
- Open Source
- Photography
- Podcast
- Real Estate
- Science
- Technology
- Web Development
- See [`categories.yml`](https://github.com/gatsbyjs/gatsby/blob/master/docs/categories.yml) for an up to date list of valid categories.

#### Adding new tag

If you think that there is something missing in the tag list, you can update [`categories.yml`](https://github.com/gatsbyjs/gatsby/blob/master/docs/categories.yml) and add a new one. However, we encourage you to use existing tags.

### Notes on featured sites

#### Review process

By default, all sites submitted to the Site Showcase will be reviewed by the Gatsby Site Review Board as a candidate for the 'Featured Sites' section of the showcase. If you do not want your site to be featured, please add 'DO NOT FEATURE' to the pull request.

Featured sites will be chosen quarterly based on the following criteria:

- Well known brands
- Use case diversity
- Visual appeal
- Visual diversity

#### How many can be featured at a time?

9, since that’s what can fit on one page of the site showcase

#### How to set a site as featured

_Note: the Gatsby team will choose featured sites, leave as `featured: false` when first posting_

If your site is chosen as featured, here's what to do next:

1.  Change `featured: false` to `featured: true`

2.  Add `featured` as a category:

```shell
categories:
  - featured
```

### Need to change your submission?

If you want to edit anything in your site submission later, simply edit the .yml file by submitting another PR.
