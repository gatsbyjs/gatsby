---
title: Adding Analytics
---

## Why use analytics?

Most professional website teams using Gatsby use one of three types of analytics services on their website:

- **Google Analytics** because the functionality is free and comprehensive.
- **Third-party marketing analytics** like marketing automation (Hubspot, Marketo), session recording (FullStory, Heap), or hundreds of smaller vendors
- **Google Tag Manager** or **Segment** in order to easily send data to these third-party services, or collect data with third-party scripts

Gatsby offers a plugin for most common services, making first-class integration of analytics a simple, speedy, and secure process.

When utilizing marketing analytics tools, one key tradeoff is that marketing analytics tools are often the culprit for poor website performance. As a result, tools that make it easier for marketers to add and remove analytics (via Google Tag Manager), can also make it easier for them to harm site performance without noticing.

## Adding scripts performantly

Gatsby has a built-in [Gatsby Script Component](/docs/reference/built-in-components/gatsby-script/) that aids in loading scripts performantly. It offers a convenient way to declare different loading strategies, and a default loading strategy that gives Gatsby users strong performance out of the box.

## Guides to common analytics tools

- [Google Analytics (using gtag.js)](/plugins/gatsby-plugin-google-gtag/)
- [Google Tag Manager](/plugins/gatsby-plugin-google-tagmanager/)
- [Segment](/plugins/gatsby-plugin-segment-js)

## Other Gatsby analytics plugins

- [Amplitude Analytics](/plugins/gatsby-plugin-amplitude-analytics)
- [Fathom](/plugins/gatsby-plugin-fathom/)
- [Baidu](/plugins/gatsby-plugin-baidu-analytics/)
- [Matomo (formerly Piwik)](/plugins/gatsby-plugin-matomo/)
- [Simple Analytics](/plugins/gatsby-plugin-simple-analytics)
- [Parse.ly Analytics](/plugins/gatsby-plugin-parsely-analytics/)
- [GoatCounter](/plugins/gatsby-plugin-goatcounter/)
- [PostHog](/plugins/gatsby-plugin-posthog-analytics/)
- [Plausible](/plugins/gatsby-plugin-plausible/)
- [Vercel](/plugins/gatsby-plugin-vercel/)
