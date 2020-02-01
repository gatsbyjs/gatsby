---
title: A/B Testing with Google Analytics and Netlify
---

Learn how to create an A/B test (otherwise known as a split test) with Google Analytics and Netlify. Note that Netlify uses the term "split test".

To follow along with a ready-made project, you can grab the code for the tutorial by running the following in your terminal:

```bash
git clone https://github.com/pkafei/Gatsby-Split-Test.git
```

## Creating an A/B test wtih Netlify

An A/B test compares changes on a web page. If you are creating an A/B test with Netlify, you can [use multiple Git branches containing variations of your site](https://docs.netlify.com/site-deploys/split-testing/#run-a-branch-based-test). If you are not familiar with Git branches, visit the [Git Guide](http://rogerdudler.github.io/git-guide/), which explains Git in detail.

Let’s say you read on Twitter that readers spend more time on a webpage with a blue header. You have a hunch that this might be correct, but you want some data to verify this claim.

You can use an A/B test to see if changing your header to blue actually increases page engagement.

Start this project by creating a new Gatsby site. The following example creates a new site based on [Gatsby's default starter](https://github.com/gatsbyjs/gatsby-starter-default).

```bash
gatsby new gatsby-ab-test
```

In your code editor, type `cd gatsby-ab-test`. You have the option of changing the background color or leaving it `rebeccapurple`. In this example, the header is another shade of purple `#5B3284`.

```javascript:title=src/component/header.js
const Header = ({ siteTitle }) => (
 <header
   style={{
     background: `#5B3284`,
     marginBottom: `1.45rem`,
   }}
 >
```

You are now finished with your first variation. Commit your changes to `master`, [create a new remote repository on GitHub](https://help.github.com/en/github/getting-started-with-github/create-a-repo), and push your changes.

```bash
git add src/component/header.js
git commit -m "Change header background color"
git remote add origin [your remote repo URL]
git push -u origin master
```

Now it is time to create your second variation. Create a new branch.

```bash
git checkout -b heading-variation
```

After you have made the new branch, go to `header.js` and change the background color to blue.

```javascript:title=src/component/header.js
const Header = ({ siteTitle }) => (
 <header
   style={{
     background: `#1f618d`,
     marginBottom: `1.45rem`,
   }}
 >
```

Commit your changes and push your `heading-variation` branch to GitHub.

## Deploying your site with Netlify

You have created your two variations: you have a purple header on the `master` branch and a blue header on the `header-variation` branch. Time to [deploy your site to Netlify](/docs/deploying-to-netlify/)!

After you have deployed your website, set up a [split test on Netlify](https://docs.netlify.com/site-deploys/split-testing/).

When you are setting up your split test on Netlify, navigate to the homepage of your project. In the example, the home page is https://app.netlify.com/sites/gatsby-header-variation/overview. Scroll down to 'Active Split Testing'. Choose 'Start a Split Test'. On the next page pick which branch you would like to include in the split test. In the example, we'll chose the 'master' and 'heading-variation' branch. Save your changes.

![](./images/netlify-split-test.gif)

## Creating a Google Analytics custom dimension

Custom dimensions allow you to capture and measure user behavior. You can learn more about custom dimensions from the [Google Analytics official documentation](https://support.google.com/analytics/answer/2709829?hl=en).

Go to [analytics.google.com](https://analytics.google.com). If you have not already done so, sign up for an account. 

After you've created an account, you'll need to create a custom dimension. Head over to the bottom left navigation panel and choose "Admin". On the next page, under Admin, you will see three columns: "Account", "Property", and "View". Go to "Property" and select "Custom Dimension". A submenu will appear. Choose "Custom Dimension" again. On the next page, select "+ New Custom Dimension" and create a new custom dimension.

![](./images/create-custom-dimension.gif)

## Injecting your Google Analytics script

After you have set up your custom dimension on Google Analytics, go to your site’s home page on Netlify and navigate to "Site Settings".

Choose "Build & Deploy" and scroll down to "Post Processing". Post Processing is where you are going to add your Google Analytics (GA) script to Netlify. Your GA script is located in the Google Analytics Admin.

When you have pasted the GA Script into Post Processing, be sure to add your custom dimension, and set it to the name of your branch. Let’s say you have two custom dimensions, and you want to use `gatsby`.
![](./images/custom-dimensions-screenshot.png)

```javascript
ga("send", "pageview", {
  dimension2: "{{ BRANCH }}",
})
```

‘{{ BRANCH }}’ is the name of the two branches we deployed. In our case, this variable references the `master` and the `heading-variation`.

Notice our variable is `dimension2` and not `Gatsby`. It is important that the variable expresses the index of your custom dimension name and not the actual name itself.

This is the final result::

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

![](./images/post-processing.gif)

## Checking your results on Google Analytics

It takes some time for Google Analytics to record the results of the A/B test. Wait about half a day and then log into your Google Analytics account. Go to the navation on the lefthand side of the page and select Behavior. From the submenu choose "Site Content", and from there select "All Pages".

On "All Page" you will see a line graph. Below the line graph on the left-hand side there is a "Secondary dimension" button. Select the "Secondary dimension" button and select "Custom Dimensions". Choose the custom dimension that you created earlier and you should see the names of the branches you created in Netlify. In this example, the `master` and `heading-variation` branches are displayed in the table.

![](./images/secondary-dimensions.gif)

## Other resources

- Netlify's documentation for [running branch-based split tests](https://docs.netlify.com/site-deploys/split-testing/)
- Google Analytics documentation on [custom dimensions and metrics](https://support.google.com/analytics/answer/2709828)
