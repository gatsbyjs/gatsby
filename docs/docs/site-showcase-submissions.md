---
title: Site Showcase Submissions
---

Want to submit a site to the [Site Showcase](https://next.gatsbyjs.org/showcase/)? Follow these instructions.

## Steps

There are only three major steps :)

1. If this is your first contribution to the Gatsby open source repo, follow the [Contribution guidelines](https://next.gatsbyjs.org/docs/how-to-contribute/#contributing-to-the-repo) to get push access rights. 

2. If there is a chance that someone else could have already submitted the site, please make sure no one else has already submitted it by searching existing PRs: https://github.com/gatsbyjs/gatsby/pulls

3.  Edit the [`sites.yml`](https://github.com/gatsbyjs/gatsby/blob/master/docs/sites.yml) file by adding your submission to the bottom of the list of sites in the following format:

```yaml
- title: Title of the Site
  description: >
    This description will appear in the modal detail view and permalink views for your site.

  # this URL is used to generate a screenshot
  main_url: http://titleofthesite.com/
  
  # this is the URL that is linked from the showcase
  url: http://titleofthesite.co.uk/

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

## Helpful information

### Categories

Categories currently include both _type of site_ (structure) and the _content of the site_. You will place all these under "categories" in your submission for now. The reason these are in two separate lists here is to show that you can have a school's marketing site (type of site would be marketing, and content would be education) or a site that delivers online learning about marketing (type of site would be education and content would be marketing).

#### Type of site

- Blog
- Directory
- Documentation
- eCommerce
- Education
- Gallery
- Landing
- Marketing
- Portfolio
- (feel free to create new ones after checking to make sure the tag you want doesn't already exist)

#### Content of site:

A few notes on site content: a common question is this: "aren't all Gatsby sites technically in the "web dev" category?" Well, no because this category means the _content_ of the site has to be about web development, like [ReactJS](https://reactjs.org/). Also, the difference between technology and web dev is like this. [Cardiogram](https://cardiogr.am/) is technology, while [ReactJS](https://reactjs.org/) is web dev.

- Agency
- Corporate
- Cinema
- Creative
- Education
- Entertainment
- Finance
- Food
- Healthcare
- Hosting
- Gallery
- Government
- Magazine
- Marketing
- Miscellaneous
- Music
- News
- Nonprofit
- Open Source
- Personal
- Photography
- Podcast
- Real Estate
- Retail
- Technology
- Web Dev
- (feel free to create new ones after checking to make sure the tag you want doesn't already exist)

### Note on Featured Sites

#### Review process

By default, all sites submitted to the Site Showcase will be reviewed by the Gatsby Site Review Board as a candidate for the 'Featured Sites' section of the showcase. If you do not want your site to be featured, please add 'DO NOT FEATURE' to the pull request.

Featured sites will be chosen quarterly based on the following criteria:

- how the site performs according to a set of criteria TBD by the Gatsby Site Review Board
- voting by the community

#### How to Set a Site as Featured

_Note: the Gatsby team will choose featured sites, leave as `featured: false` when first posting_

If you're site is chosen as featured, here's what to do next:

1.  Change `featured: false` to `featured: true`

2.  Add `featured` as a category:

```shell
categories:
  - featured
```

### Change your mind / need to edit your submission?

If you want to edit anything in your site submission later, simply edit the .yml file by submitting another PR.
