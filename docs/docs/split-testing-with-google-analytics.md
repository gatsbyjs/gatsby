---
title: Split Testing with Google Analytics
---

In this guide we will walk you through how to create a split test (or an A/B test) with Google Analytics and Netlify.

The A/B example we are going to use can be found in this repo.

Create Your Split Test

A split test compares two different changes on a web page. If you are creating a split test with Netlify then each git branch will contain your webpage’s variation. If you are not familiar with git branches, then visit the Git Guide which explains Git in detail.

Let’s say you read on twitter that readers spend more time on a webpage with a blue header. You have a hunch that this might be correct, but you want some data to verify this claim.

You can use a split test to see if changing your header blue actually increases page engagement.

You start this project by cloning the Gatsby Starter Repo.

```
 git clone https://www.gatsbyjs.org/starters/gatsbyjs/gatsby-starter-default/

```

After cloning the repo, in your code editor, type `cd gatsby-starer-default`. You have the option of changing the background color or leaving it `rebeccapurple`. In this example, we changed the header to another shade of purple `#5B3284`.

src/component/header.js

```javascript
const Header = ({ siteTitle }) => (
 <header
   style={{
     background: `#5B3284`,
     marginBottom: `1.45rem`,
   }}
 >
```

We are now finished with our first variant. Let’s commit our changes to `master` and push them to Github.

Now it is time to create our second variant. Let’s create a new branch `git checkout -b heading-variation`. After you have made the new branch, go to header.js and change the background color to blue.

src/component/header.js

```javascript
const Header = ({ siteTitle }) => (
 <header
   style={{
     background: `#1f618d`,
     marginBottom: `1.45rem`,
   }}
 >
```

Proceed to commit your changes and push up your branch `heading-variation` to Github.

Create a Split Test With Netlify

You have created your two variations, you have a purple header on the `master` branch, and a blue header on the `header-variation` branch. Now it is time to deploy your site onto Netlify.

After you have deployed your website, go and set up a split test on Netlify.

https://makeagif.com/gif/setting-up-split-test-with-netlify-4-v1Vp

Create Google Analytics Custom Dimension

Sign up for a Google Analytics Account
Next set up a custom dimension. A custom dimension allows us to capture and measure user behavior. You can learn more about custom dimensions at Google Analytic’s official documentation.
https://makeagif.com/gif/how-to-set-up-a-custom-dimension-in-google-analytics-A1Kf0e

You are done with Google Analytics for now- head to Netlify

    Inject Google Analytics to Snippet with Netlify

After you have set up your custom dimension on Google Analytics, go to your site’s home page on Netlify and click on Site settings.
There should be a navigation bar on your left. Choose Build & Deploy and scroll down to Post Processing
Post processing is where you are going to add your Google Analytics script to Netlify. Your GA script is located in the Google Analytics Admin.
  
When you have pasted the GA Script to Post Processing be sure to add your custom dimension, and set it to the name of your branch. Let’s say you have two custom dimensions, and you want to use `gatsby`.

```javascript
ga("send", "pageview", {
  dimension2: "{{ BRANCH }}",
})
```

‘{{ BRANCH }}’ is the name of the two branches we deployed. In our case, this variable references the `master` and the `heading-variation`.

Notice our variable is `dimension2` and not `Gatsby`. It is important that the variable expresses the index of your custom dimension name and not the actual name itself.

This is the final result::

<!-- Google Analytics -->

```javascript
<script>
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-143111087-2', 'auto');
ga('send', 'pageview', {
   'dimension2': '{{ BRANCH }}'
});
</script>
```

<!-- End Google Analytics -->

https://makeagif.com/gif/post-processing-netlify-ETBiYm

Checking Your Split Test on Google Analytics

It takes some time for Google Analytics to record the results of the split test. Wait about half a day and then go into Behavior/Site Content/All Pages to find the results. In order for the variable to appear, be sure to choose Secondary Dimension.

https://makeagif.com/gif/secondary-dimension-ga-aWSmDZ

Resources:

https://docs.netlify.com/site-deploys/split-testing/

https://support.google.com/analytics/answer/2709828
