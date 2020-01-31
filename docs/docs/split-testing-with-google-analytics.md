---
title: Split Testing with Google Analytics
---

In this guide, we will walk you through how to create a split test (otherwise known as an A/B test) with Google Analytics and Netlify.

If you want to follow along- you can grab the code for the tutorial. `gatsby new https://github.com/pkafei/Gatsby-Split-Test`.

## Create Your Split Test

A split test compares changes on a web page. If you are creating a split test with Netlify then each [git branch will contain your webpage’s variation](https://docs.netlify.com/site-deploys/split-testing/#run-a-branch-based-test). If you are not familiar with git branches, then visit the [Git Guide](http://rogerdudler.github.io/git-guide/) which explains Git in detail.

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

We are now finished with our first variation. Let’s commit our changes to `master` and push them to Github.

Now it is time to create our second variation. Let’s create a new branch `git checkout -b heading-variation`. After you have made the new branch, go to header.js and change the background color to blue.

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

## Create a Split Test With Netlify

You have created your two variations, you have a purple header on the `master` branch, and a blue header on the `header-variation` branch. Now it is time to [deploy your site onto Netlify](https://www.gatsbyjs.org/docs/deploying-to-netlify/).

After you have deployed your website, go and set up a [split test on Netlify](https://docs.netlify.com/site-deploys/split-testing/).

When you are setting up your split test on Netlify, navigate to the homepage of your project. In the example, the home page is https://app.netlify.com/sites/gatsby-header-variation/overview. Scroll down to 'Active Split Testing'. Choose 'Start a Split Test'. On the next page pick which branch you would like to include in the split test. In the example, we'll chose the 'master' and 'heading-variation' branch. Save your changes.

![](./images/netlify-split-test.gif)

## Create Google Analytics Custom Dimension

Custom dimensions allows us to capture and measure user behavior. You can learn more about custom dimensions at [Google Analytic’s official documentation](https://support.google.com/analytics/answer/2709829?hl=en).

Go to https://analytics.google.com. If you have not already done so, sign up for an account. After you've created an account go on and create a custom dimension. Head over to the bottom left navigation panel and choose 'Admin'. On the next page under admin you will see three columns- 'Account', 'Property' and 'View'. Go to 'Property' and click on 'Custom Dimension'. There will appear a submenu where you will choose 'custom dimension' again. On the next page, click on '+ New Custom Dimension' and create a new custom dimension.

You are done with Google Analytics for now- head to Netlify.

![](./images/create-custom-dimension.gif)

## Inject Google Analytics to Snippet with Netlify

After you have set up your custom dimension on Google Analytics, go to your site’s home page on Netlify and click on Site settings.
There should be a navigation bar on your left. Choose Build & Deploy and scroll down to Post Processing. Post processing is where you are going to add your Google Analytics script to Netlify. Your GA script is located in the Google Analytics Admin.

When you have pasted the GA Script to Post Processing be sure to add your custom dimension, and set it to the name of your branch. Let’s say you have two custom dimensions, and you want to use `gatsby`.
![](./images/custom-dimensions-screenshot.png)

```javascript
ga("send", "pageview", {
  dimension2: "{{ BRANCH }}",
})
```

[‘{{ BRANCH }}’ is the name of the two branches we deployed](https://docs.netlify.com/site-deploys/split-testing/#run-a-branch-based-test). In our case, this variable references the `master` and the `heading-variation`.

Notice our variable is `dimension2` and not `Gatsby`. It is important that the variable expresses the index of your custom dimension name and not the actual name itself.

This is the final result::

<!-- Google Analytics -->

```javascript
<script>
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-XXXXXXXXX-X', 'auto');
ga('send', 'pageview', {
   'dimension2': '{{ BRANCH }}'
});
</script>
```

<!-- End Google Analytics -->

![](./images/post-processing.gif)

## Checking Your Split Test on Google Analytics

It takes some time for Google Analytics to record the results of the split test. Wait about half a day and then log into your Google Analytics account. Go to the navation on the left-hand side of the page and click on 'Behavior'. From the submenu choose 'Site Content', and from there click on 'All Pages'.

On 'All Page' you will see a line graph. Below the line graph on the left-hand side there is a 'Secondary dimension' button. Click on the 'Secondary dimension' button and proceed to click on 'Custom Dimensions'. Choose the custom dimension that you have created earlier, and below you should see the names of the branches you created in Netlify. In this example, we see the branch 'master' and 'heading-variation' in the table below.

![](./images/secondary-dimensions.gif)

Resources:

https://docs.netlify.com/site-deploys/split-testing/

https://support.google.com/analytics/answer/2709828
