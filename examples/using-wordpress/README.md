# Using WordPress

This is an example which contains sample code for demonstrating how to source data from WordPress using the [gatsby-source-wordpress plugin](https://www.gatsbyjs.com/plugins/gatsby-source-wordpress/). This example is created to serve as an extension to the example code provided in the [Sourcing from WordPress recipe](https://www.gatsbyjs.com/docs/recipes/sourcing-data#sourcing-from-wordpress) in the Sourcing data section. It is meant for the purpose of learning and contains code that cannot be included in the recipe itself.
In this section, we will integrate your WordPress site with Gatsby. We would point Gatsby to the address of our WordPress blog to enable it to pull the latest data when we run the development server or generate the static pages.

The process of connecting Gatsby to WordPress is to fetch your WordPress data, which is triggered by a build. Once Gatsby has fetched the WordPress data, it creates the static site based on the current template.
