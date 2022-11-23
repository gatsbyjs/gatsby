---
title: Making Your Site Accessible
examples:
  - label: Using reach-skip-nav
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/using-reach-skip-nav"
---

The Gatsby team is passionate about helping you create websites that work for everyone, with helpful defaults that bake in web accessibility as well as performance optimizations. By making your website accessible to people with disabilities, you can make more inclusive sites that reach and remove barriers for more people on the Internet.

## What is web accessibility?

[Web accessibility](https://www.w3.org/WAI/fundamentals/accessibility-intro/#what) means that websites, tools, and technologies are designed and developed so that people with disabilities can use them. But not only people with permanent disabilities benefit from it. Accessibility also benefits people with temporary disabilities. For example, imagine being in an environment where you cannot listen to audio or you can't use a computer because of a broken arm.

Back in the early days of the Web, Tim Berners-Lee, inventor of the World Wide Web, [said](https://www.w3.org/Press/IPO-announce):

> "The power of the Web is in its universality.
> Access by everyone regardless of disability is an essential aspect."

The web of today is an important resource in many aspects of life such as health care, education, or commerce. Accessibility is an important consideration when building for the web.

Accessibility supports [social inclusion for everyone](https://www.w3.org/standards/webdesign/accessibility#case), and has a strong [business case](https://www.w3.org/WAI/business-case/).

## Gatsby makes accessibility easier

While ultimately it's up to you to develop your site with accessibility in mind, Gatsby aims to provide as much out-of-the-box support as possible.

### Accessible routing

One of the most common features of every site is navigation. People should be able to navigate across your pages and content in an intuitive and accessible way.

That's why every Gatsby site aims to have an accessible navigation experience by default. Thanks to [@reach/router](https://reach.tech/router), a routing library for React, Gatsby handles page announcements for screen readers on page change. We're actively making improvements to this experience, and we [welcome your feedback](/accessibility-statement/).

Since the [second major release](/blog/2018-09-17-gatsby-v2/), your Gatsby sites use `@reach/router` under the hood. While additional accessibility testing is always a good idea, the [Gatsby Link Component](/docs/reference/built-in-components/gatsby-link/) wraps [@reach/router's Link component](https://reach.tech/router/api/Link) to improve accessibility without you having to think about it. `@reach/router` also supports [scroll restoration](/docs/how-to/routing/scroll-restoration).

### Gatsby builds HTML pages by default

For websites, rendering [static HTML](/docs/glossary#static) pages means that JavaScript isn't required to access and navigate through content. Gatsby [compiles](/docs/glossary#compiler) HTML pages by default from React components using [Node.js](/docs/glossary#nodejs), meaning you don't have to worry about setting up server-rendering yourself to support [progressive enhancement](/docs/glossary#progressive-enhancement). With Gatsby's static support out of the box, you can build dynamic sites that still enable user access without requiring [client-side](/docs/glossary#client-side) scripting.

### Linting with eslint-plugin-jsx-a11y

Gatsby ships with the `eslint-plugin-jsx-a11y` package and warnings for all of its rules enabled by default. [eslint-plugin-jsx-a11y](https://github.com/evcohen/eslint-plugin-jsx-a11y) is an accessibility [linting](/docs/glossary#linting) tool for your code, helping you develop more inclusive Gatsby projects by reducing the time to find accessibility errors. This plugin encourages you to include alternative text for image tags, validates [ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) props, and eliminates redundant role properties, among other things.

For more on supported rules, check out the docs for [`eslint-plugin-jsx-a11y`](https://github.com/evcohen/eslint-plugin-jsx-a11y). You can customize those rules in your [`.eslintrc`](/docs/how-to/custom-configuration/eslint/#configuring-eslint).

```json:title=.eslintrc
{
  "extends": ["react-app", "plugin:jsx-a11y/recommended"],
  "plugins": ["jsx-a11y"],
  "rules": {
    "jsx-a11y/rule-name": "warn"
  }
}
```

Note: Including a local `.eslintrc` file will [override](/docs/how-to/custom-configuration/eslint/#configuring-eslint) all of Gatsby's default linting and disable the built-in `eslint-loader`, meaning your tweaked rules won't make it to your browser's developer console or your terminal window but will still be displayed if you have ESLint plugins enabled in your IDE. If you would like to change this behavior and make sure the `eslint-loader` pulls in your customizations, you'll need to enable the loader yourself. One way to do this is by using the Community plugin [`gatsby-plugin-eslint`](/plugins/gatsby-plugin-eslint/). Additionally, if you would still like to take advantage of some subset of the default [ESLint config Gatsby ships with](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/utils/eslint-config.ts), you'll need to copy them manually to your local `.eslintrc` file.

This is a start to testing for accessibility: [further recommendations](#how-to-improve-accessibility) can be found below.

## Tips for improving web accessibility

Accessibility by default is a win for everyone. Here's a starting point for accessibility testing when making a Gatsby site or theme:

- [Use your keyboard](https://webaim.org/techniques/keyboard/) to tab through the pages. Can you reach and operate every interactive control (links, buttons, form inputs, etc.) and see a focus indicator on the screen?
- Use [Lighthouse](https://developers.google.com/web/tools/lighthouse/), [axe](https://www.deque.com/axe/) or [Accessibility Insights](https://accessibilityinsights.io/) to find and fix common accessibility issues in development
- Test for [adequate color contrast](https://dequeuniversity.com/tips/color-contrast) with the [accessibility color picker in Chrome Developer Tools](https://developers.google.com/web/updates/2018/01/devtools#contrast)
- Create inclusive and [accessible forms](/docs/building-a-contact-form#creating-an-accessible-form)
- Employ accessible [headings, landmarks, and semantic structure](https://webaim.org/techniques/semanticstructure/)
- Include [image, video, and audio text alternatives](https://a11y-style-guide.com/style-guide/section-media.html)
- Test for [screen magnification and zoom](https://axesslab.com/make-site-accessible-screen-magnifiers/)
- Ensure accessibility of [interactive menus, modals, and custom widgets](https://developer.mozilla.org/en-US/docs/Web/Accessibility/An_overview_of_accessible_web_applications_and_widgets)
- Create safe [animations and motion](https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity/)
- Write [Cypress accessibility tests](/docs/how-to/testing/end-to-end-testing/#writing-tests) for your site or application

## Accessibility resources

- [React accessibility](https://reactjs.org/docs/accessibility.html)
- [Gatsby’s commitment to accessibility](/blog/2019-04-18-gatsby-commitment-to-accessibility/)
- [How to do an accessibility review](https://developers.google.com/web/fundamentals/accessibility/how-to-review) from Google Web Fundamentals
- [A11y Project's Quick Tests](https://a11yproject.com/#Quick-tests)
- [The importance of manual accessibility testing](https://www.smashingmagazine.com/2018/09/importance-manual-accessibility-testing/) from Smashing Magazine
- [Writing Automated Tests for Accessibility](https://www.24a11y.com/2017/writing-automated-tests-accessibility/)
- [Free web accessibility course](https://www.udacity.com/course/web-accessibility--ud891) by Google and Udacity
- [WebAIM introduction](https://webaim.org/intro/) to web accessibility
- [Deque University](https://dequeuniversity.com), with free online accessibility training for people with disabilities
- [Web.dev accessibility docs](https://web.dev/accessible)
- [All Gatsby accessibility blog posts](/blog/tags/accessibility/)
