---
title: Adding analytics
---

### Why use analytics?

Once you have your site live you will start wanting to get an idea of how many visitors are coming to your site along with other metrics such as:

- What pages are most popular?
- Where do my visitors come from?
- When do people visit my site?

Google Analytics provides a way to collect this data and perform analytics on it answering the above questions among many others. The platform is free for 10 million hits per month per Tracking ID.

The Tracking ID is what is used to identify data with your site's traffic. You would typically use a different Tracking ID for each website you are monitoring.

### Setting up analytics with Google Analytics

First step is to set up a Google Analytics account. You can do that [here](https://analytics.google.com/) by signing in with your Google Account.

Google also has a [get started page](https://support.google.com/analytics/answer/1008015?hl=en) get started page for reference.

Once you have an account you will be prompted to set up a new property. This property will have a Tracking ID associated with it. In this case the property will be the website itself. Fill out the below form with your website name and URL

Once complete you should now have a Tracking ID take note of it as your website will need to reference it when sending page views to Google Analytics. It should be in the format `UA-XXXXXXXXX-X`.

You can find this tracking ID later by going to `Admin > Tracking Info > Tracking Code`.

Now to configure Gatsby to send page views to your Google Analytics account.

We are going to use `gatsby-plugin-google-analytics`, for other analytics options (includeing Google Analytics gtag.js ang Google Tag Manager) check [Other Gatsby analytics plugins](#other-plugins)

```bash
npm install --save gatsby-plugin-google-analytics
```

```js:title=gatsby-config.js
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: "UA-XXXXXXXXX-X",
      },
    },
```

Here replace `UA-XXXXXXXXX-X` with your own Tracking ID.

Full documentation for the plugin can be found in the Gatsby plugins documentation [here](/packages/gatsby-plugin-google-analytics/) or on the Github page [here](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-google-analytics)

There are a number of extra configuration options both with the Gatsby plugin and also on Google Analytics itself so you can tailor to meet your website's needs.

Once this is configured you can deploy your site to test! If you navigate to Home on Google Analytics you should see a dashboard with different statistics.

### <a name="other-plugins"></a>Other Gatsby analytics plugins
- [Google Tag Manager](/packages/gatsby-plugin-google-tagmanager/)
- [Google Analytics gtag.js](/packages/gatsby-plugin-gtag/)
- [Segment](/packages/gatsby-plugin-segment)
- [Amplitude Analytics](/packages/gatsby-plugin-amplitude-analytics)
- [Fathom](/packages/gatsby-plugin-fathom/)
- [Baidu](/packages/gatsby-plugin-baidu-analytics/)
