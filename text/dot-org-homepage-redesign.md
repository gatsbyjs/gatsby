- Start Date: 2019-03-01
- RFC PR: (leave this empty)
- Gatsby Issue: (leave this empty)

# Summary

Proposal to update copy on the Gatsby homepage in addition to two designs. Thanks to @fk, @kyleamathews, @jlengstorf, @amberleyromo, @marisamorby, and @lindabumblebee for working as a team to get to this point!

# Motivation

The motivation is found in these googledocs, which are blogposts about the research we've done on the homepage. In summary, the current .org homepage doesn't communicate what Gatsby is very accurately and doesn't demonstrate Gatsby's value as quickly as it could (namely, the text blocks tell about the value, and yet aren't persuasive).

https://docs.google.com/document/d/1C3FwnMw29mLQgUIvuK2Zc4U1S_scqe49HVtVQ4AjjM8/edit?usp=sharing
https://github.com/gatsbyjs/gatsby/pull/12231

# Detailed design

Change design so mobile site looks somewhat like this:
https://www.figma.com/proto/0rROnAzH4mFLYLEx9TDleN/For-Flo-Gatsbyjs.org-mobile-homepage-prototype?node-id=140%3A487&viewport=-1603%2C423%2C1&scaling=scale-down

The second CTA would lead to a page which hasn't been created yet. A landing page for the docs that shows quick links for different use cases.

# Drawbacks

Why should we _not_ do this? Please consider:

- we could be wrong about how effective these changes will be and make things worse with fewer people wanting to click on "Get Started"
- the community could disagree with the change, which could create conflict

# Alternatives

Other designs we tested:

- [Current .org homepage](https://www.gatsbyjs.org/): ([results](https://docs.google.com/document/d/1C3FwnMw29mLQgUIvuK2Zc4U1S_scqe49HVtVQ4AjjM8/edit?usp=sharing))
- [These Figma prototypes](https://www.figma.com/proto/UH2Qb3IeF8Hvg6csIW3mcqFc/Gatsbyjs.org-mobile-homepage-prototype?node-id=22%3A329&viewport=-227%2C349%2C0.39312&scaling=scale-down): ([results](https://docs.google.com/document/d/1C3FwnMw29mLQgUIvuK2Zc4U1S_scqe49HVtVQ4AjjM8/edit?usp=sharing))
- [This messaging survey and its results](https://github.com/gatsbyjs/gatsby/pull/12231)

# Adoption strategy

This is not a breaking change and existing developers' workflows will not likely be changed by these edits since the homepage is primarily used by new visitors.

# How we teach this

It might take some marketing to get people to adopt "Gatsby is a framework" instead of "Gatsby is a generator". I'd say sharing this RFC, the new homepage design, and a blogpost about it ought to be enough!

# Unresolved questions

What will replace the text blocks on the homepage? My top vote:

- example of page load time improvements (to demonstrate "performance out of the box" value)
- example of time saved in development process (to demonstrate "productive from the start" value)
- example of conversion rate improvements (to demonstrate "fast sites" value)

Other ideas:

- Pictures of lighthouse scores "before and after"
- tweets about Gatsby
- pictures of Gatsby contributors
- # of sites built with Gatsby stats
- # of happy swear words said about Gatsby
