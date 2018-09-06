---
title: Submit to Creator Showcase
---

Want to be a part of the [Creator Showcase](link TBA)? Follow these instructions.

## Steps

There are only two major steps :)

1.  If this is your first contribution to the Gatsby open source repo, follow the [Contribution guidelines](https://next.gatsbyjs.org/docs/how-to-contribute/#contributing-to-the-repo).

2.  Edit the [`creators.yml`](link TBA) file by adding your submission to the bottom of the list of sites in the following format:

```yaml
- name: Your Name
  # There are three `types`: agency, company, and individual
  type: agency
  description: >-
    We help agencies and companies with JAMStack tools. This includes web
    development using Static Site Generators, Headless CMS, CI / CD and CDN
    setup.
  location: Poland
  website: 'https://yourname.io/'
  github: 'https://github.com/githubusername'
  image: image.jpg
  # Right now, you can only answer true to either `for_hire` or for `hiring`, but not for both.
  for_hire: true
  hiring: false
  # If you mark `portfolio: true`, any sites you have in the Site Showcase that say `built_by: your name` will be linked to your Creator Profile. So make sure your name is exactly the same in both `sites.yml` and `creators.yml`.
  portfolio: true
```

### Review process

By default, all edits submitted to the Creator Showcase will be reviewed through the regular PR approval and merge process.

### Change your mind / need to edit your submission?

If you want to edit anything in your site submission later, simply edit the `creators.yml` file by submitting another PR.
