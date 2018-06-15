---
title: Site Showcase Submission
---
Want to submit a site to the site showcase? Follow these instructions.

# Steps

There are only two major steps :)

1. If there is a chance that someone else could have already submitted the site, please make sure no one else has already submitted it by searching existing PRs: https://github.com/gatsbyjs/gatsby/pulls

2. Edit [gatsby/www/src/data/sites.yml](gatsby/www/src/data/sites.yml) by adding your submission to the bottom of the list of sites in the following format:

```shell
- title: Title of the Site
  main_url: 'http://titleofthesite.com/' //this is the URL that the screenshot comes from//
  url: 'http://titleofthesite.co.uk/'
  featured: false
  description: >-
    This description will appear in the modal detail view and permalink views for your site.
  categories:
    - Relevant category 1
    - Relevant category 2
    - // You can list as many categories as you want here //
    - // If you'd like to create a new category, simply list it here //
  built_by: Name of creator(s) or team/agency/business that created the site
  built_by_url: 'https://twitter.com/creatorname' //this could also be the URL to the site of your portfolio, your agency or company's site, etc.//
```


# Helpful information

## Categories

Categories currently include both *type of site* (structure) and the *content of the site*. You will place all these under "categories" in your submission for now. The reason these are in two separate lists here is to show that you can have a school's marketing site (type of site would be marketing, and content would be education) or a site that delivers online learning about marketing (type of site would be education and content would be marketing).

### Type of site
- Blog
- Directory
- Documentation
- eCommerce
- Education
- Gallery
- Landing
- Marketing
- Portfolio

### Content of site:
A few notes on site content: a common question is this: "aren't all Gatsby sites technically in the "web dev" category?" Well, no because this category means the _content_ of the site has to be about web development, like [ReactJS](https://reactjs.org/). Also, the difference between technology and web dev is like this. [Cardiiogram](https://cardiogr.am/) is technology, while [ReactJS](https://reactjs.org/) is web dev.
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

## Note on Featured Sites

Featured sites are chosen the first week of every quarter based on the following criteria:
* wide-reach (site is very popular)
* prestige (creator, content, or company is very well-known)
* unique use case
* unique design

Please mention here if you think the site you're submitting ought to be featured and why (which of the above criteria apply). If, during the quarterly review process, your site gets selected to be featured, you'll need to change the fields below:

1. Change `featured: false` to `featured: true`

2. Add "featured" as a category:

```shell
categories:
- featured
```

## Change your mind / need to edit your submission?

If you want to edit anything in your site submission later, simply edit the .yaml file by submitting another PR.