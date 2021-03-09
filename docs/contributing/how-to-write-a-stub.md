---
title: How to Write a Stub
---

Sometimes you might have an idea for a Gatsby.js documentation page or agree upon a suggestion in a GitHub issue, but don't have the time or resources to write that page yourself. Rather than let the idea drift off into space, consider **creating a documentation stub** to act as a content placeholder. That way, other members of the community (and/or you, in the future) can come back and fill in the details.

A **stub** is a temporary placeholder for a piece of Gatsby.js documentation tied to a GitHub issue, using this format (feel free to copy and paste, changing the title and issue number):

```markdown:title=how-to-tame-dragons.md
---
title: How to Tame Dragons
issue: https://github.com/gatsbyjs/gatsby/issues/XXXX
---

This is a stub. Help our community expand it.

Please use the [Gatsby Style Guide](/contributing/gatsby-style-guide/) to ensure your
pull request gets accepted.
```

If you have any questions about titles or other details related to creating stubs, feel free to ask us on a relevant GitHub issue.

## Converting a Stub to a Doc

To change a stub into a living-breathing document, remove the `issue` entry from a stub's frontmatter (a fancy name for Markdown metadata) and replace the boilerplate content with
your wonderful prose and code. Save the file, commit to GitHub, open a PR, get feedback. Learn more in our page on [docs contributions](/contributing/docs-contributions/).

If you wish to see any of the available stubs, head over to the current [Stub List](/contributing/stub-list/).
