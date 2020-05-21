---
title: Submit to Starter Library
---

Have you created a Gatsby starter you'd like to add to the [Starter Library](/starters/)? Follow these instructions.

## Steps

To get your site added to the starter library, follow the two steps below.

1. If this is your first contribution to the Gatsby open source repo, follow the [Contribution guidelines](/contributing/code-contributions/).

2. Edit the [`starters.yml`](https://github.com/gatsbyjs/gatsby/blob/master/docs/starters.yml) file by adding your starter information to the bottom of the list in the following format:

```yaml:title=docs/starters.yml
- url: Link to a demo of your starter
  repo: Link to GitHub repo
  description: Your starter description

  # These correspond to the category filters in the library
  # See docs/categories.yml for valid tags.
  tags:
    - Redux

  # Add your site features
  # These will be included on your starter's detail page.
  features:
    - Blog post listing with previews (image + summary) for each blog post
```

Use the following template to ensure required fields are filled:

```yaml:title=docs/starters.yml
- url: (required)
  repo: (required - https://github.com/{username}/{titleofthesite})
  description: (optional)
  tags:
    - (required)
  features:
    - (required)
```

Check out the [`starters.yml`](https://github.com/gatsbyjs/gatsby/blob/master/docs/starters.yml) file for examples.

We prefer pull requests with the title in the following format:
`chore(starters): add my-starter-name-here`
If there are linting issues with your PR, you can fix them by running `npm run format`.

### Need to change details?

If you want to edit anything in your site submission later, simply edit the .yml file by submitting another PR. GitHub data (like stars) will be automatically pulled and updated, but your starter description, tags, and feature list are up to you!

### Adding new tag

If you think that there is something missing in the tag list, you can update [`categories.yml`](https://github.com/gatsbyjs/gatsby/blob/master/docs/categories.yml) and add a new one. However, we encourage you to use existing tags.
