---
title: Submit to Creator Showcase
---

Want to be a part of the [Creator Showcase](/creators)? Follow these instructions.

## Steps

There are only two major steps :)

1.  If this is your first contribution to the Gatsby open source repo, follow the [Contribution guidelines](/contributing/code-contributions/).

2.  Upload a photo of yourself or a logo of your company/agency to [`this directory`](https://github.com/gatsbyjs/gatsby/tree/master/docs/creators/images). Images should have a square aspect ratio with 500px minimum (e.g. 500px X 500px) to 1000px maximum resolution and should carry the same name as what you put in the name field on creators.yml, but with a dash instead of spaces.

    For example,

    **if name is:** _Fabian Schultz_

    **image name should be,** _fabian-schultz.jpg_

    **if name is:** _Iron Cove Solutions_

    **image name should be,** _iron-cove-solutions.jpg_

3.  Edit the [`creators.yml`](https://github.com/gatsbyjs/gatsby/blob/master/docs/creators/creators.yml) file by adding your submission to the bottom of the list of sites in the following format:

```yaml:title=docs/creators/creators.yml
- name: Your Name

  # You can choose one of three `types`: agency, company, or individual
  type: agency
  description: >-
    We help agencies and companies with JAMStack tools. This includes web
    development using Static Site Generators, Headless CMS, CI / CD and CDN
    setup.
  location: Poland
  website: https://yourname.io/
  github: https://github.com/githubusername
  image: images/image.jpg

  # Right now, you can only answer true to either `for_hire` or for `hiring`, but not for both.
  for_hire: true
  hiring: false

  # If you mark `portfolio: true`, any sites you have in the Site Showcase that say `built_by: [imagine your name here]` will be linked to your Creator Profile. So make sure that `name`in `creators.yml` is exactly the same as `built_by` in `sites.yml`.
  portfolio: true
```

Use the following template to ensure required fields are filled:

```yaml:title=docs/creators/creators.yml
- name: (required)
  type: (required - agency, company, or individual)
  image: (required - images/{filename}.{ext})
  description: >-
    (optional)
  location: (optional)
  website: (optional)
  github: (optional)
  for_hire: (optional)
  hiring: (optional)
  portfolio: (optional)
```

4. If you sent your websites to the Showcase before but have not filled out the "built_by" field, you should edit [`sites.yml`](https://github.com/gatsbyjs/gatsby/blob/master/docs/sites.yml) and add your name (and the built_by field if it is not there) there as well to make sure your portfolio pieces are linked to your page.

### Review process

By default, all edits submitted to the Creator Showcase will be reviewed through the regular PR approval and merge process.

### Change your mind / need to edit your submission?

If you want to edit anything in your site submission later, simply edit the `creators.yml` file by submitting another PR.
