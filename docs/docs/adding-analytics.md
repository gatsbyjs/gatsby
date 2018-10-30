---
title: Adding analytics
---

## Why use analytics?

Once you have your site live you will start wanting to get an idea of how many visitors are coming to your site along with other metrics that can help you to understand what's working for you and where can you make some improvements.

Here are a few reasons to use analytics:

* To understand what pages are most popular? What keywords are making people come to your site?
* Where do my visitors come from? And are they new or returning visitors?
* When do people visit my site?

Google Analytics provides a way to collect this data and perform analytics on it answering the above questions among many others. The platform is free for 10 million hits per month per Tracking ID. There are other analytics options--see the "Other Gatsby analytics plugins" section at the bottom of this doc for ideas.

## Setting up Google Analytics

Here's step by step guide:

1. The first step is to set up a Google Analytics account. Go to [google.com/analytics](http://www.google.com/analytics/) and do one of the following:
    * If you don't have an account, click **Start for free**.
    * Or to sign in with an existing account, click **Sign in to Analytics**

    Google also has a [get started page](https://support.google.com/analytics/answer/1008015?hl=en) for reference.

2. Once you have an account, you will be prompted to set up a new property. This property will have a Tracking ID associated with it. In this case the property will be the website itself. Fill out the form with your website name and URL. The Tracking ID is what is used to identify data with your site's traffic. You would typically use a different Tracking ID for each website you are monitoring.

3. You should now have a Tracking ID; take note of it, as your website will need to reference it when sending page views to Google Analytics. It should be in the format `UA-XXXXXXXXX-X`. You can find this tracking ID later by going to `Admin > Tracking Info > Tracking Code`.

## Using `gatsby-plugin-google-analytics`

Now, it's time to configure Gatsby to send page views to your Google Analytics account.

We are going to use `gatsby-plugin-google-analytics`. For other analytics options (including Google Analytics gtag.js ang Google Tag Manager), check [other Gatsby analytics plugins](#other-gatsby-analytics-plugins).

```bash
npm install --save gatsby-plugin-google-analytics
```

```js:title=gatsby-config.js
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
      // replace "UA-XXXXXXXXX-X" with your own Tracking ID
        trackingId: "UA-XXXXXXXXX-X",
      },
    },
```

> Note: You'll need to replace `UA-XXXXXXXXX-X` with your own Tracking ID.

Full documentation for the plugin can be found [here](/packages/gatsby-plugin-google-analytics/).

There are a number of extra configuration options--both with the Gatsby plugin and also in your Google Analytics account--so you can tailor things to meet your website's needs.

Once this is configured you can deploy your site to test! If you navigate to the homepage of Google Analytics, you should see a dashboard with different statistics.

## Other Gatsby analytics plugins

* [Google Tag Manager](/packages/gatsby-plugin-google-tagmanager/)
* [Google Analytics gtag.js](/packages/gatsby-plugin-gtag/)
* [Segment](/packages/gatsby-plugin-segment)
* [Amplitude Analytics](/packages/gatsby-plugin-amplitude-analytics)
* [Fathom](/packages/gatsby-plugin-fathom/)
* [Baidu](/packages/gatsby-plugin-baidu-analytics/)
