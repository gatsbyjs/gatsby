# Why use this plugin?

- [Why use this plugin?](#why-use-this-plugin)
  - [Why use Gatsby instead of WordPress PHP templates?](#why-use-gatsby-instead-of-wordpress-php-templates)
    - [Related information:](#related-information)
  - [Why use this plugin instead of X source plugin?](#why-use-this-plugin-instead-of-x-source-plugin)
  - [Up Next :point_right:](#up-next-point_right)

## Why use Gatsby instead of WordPress PHP templates?

For starters you can keep using WordPress as the fantastic CMS it is, and use React and modern tooling for your front-end!

Some highlights:

- Increased security and performance due to the static rendering of Gatsby
- A componentized architecture for your front-end code with React (better maintainability)
- A simpler way of asking for data with GraphQL (no need to remember dozens of data retrieval functions)
- Client-side state management with React opens up the doors to creating an app-like or full on app experience for your users
- [Gatsby is committed to ensuring we are as accessible as possible out of the box](https://www.gatsbyjs.com/blog/2019-04-18-gatsby-commitment-to-accessibility/)

Additionally, this plugin is a great reason to use Gatsby with WordPress. Many of the complex and difficult aspects of going decoupled with WordPress have been abstracted for you behind the scenes, so you can work on building awesome apps and sites instead of reinventing the wheel to get decoupled WordPress working in your project.

Check out this page on [convincing developers why Gatsby is awesome](https://www.gatsbyjs.com/docs/winning-over-developers/#specific-benefits). It's meant for developers who want to convince their coworkers to use Gatsby, but it actually does a great job of describing directly to you the main reasons why using Gatsby is a great idea :)

### Related information:

- [ReactJS](https://reactjs.org/)
- [Gatsy Site Showcase](https://www.gatsbyjs.com/showcase/)
- [Gatsby Case Study Blog posts](https://www.gatsbyjs.com/blog/tags/case-studies/)
- [How Tinder is using WordPress with Gatsby](https://www.gatsbyjs.com/blog/2020-04-07-la-2020-boss/)
- [Zac Gordon on what Gatsby is and why to use it](https://www.youtube.com/watch?v=GuvAMcsoreI)

## Why use this plugin instead of X source plugin?

Before `gatsby-source-wordpress@v4` was released, there were 2 main ways to work with Gatsby & WordPress: `gatsby-source-wordpress@v3` and `gatsby-source-graphql`.

Both of these worked but each had it's own pitfalls and problems.

- [Problems with gatsby-source-wordpress@v3](./problems-with-v3.md)
- [Problems with gatsby-source-graphql](./problems-with-gatsby-source-graphql.md)

This plugin fixes every problem listed in those two pages :point_up:

Now we have the ability to properly cache data and this makes incremental builds, fast builds, and Preview work. Any WPGraphQL plugin now becomes a cacheable Gatsby plugin which means Gatsby and the community can build a rich plugin ecosystem around WordPress that just works! :smile:

## Up Next :point_right:

- :runner: [Installation & Getting started](./getting-started.md)
- :school: [Tutorials](./tutorials/index.md)
- :feet: [Features](./features/index.md)
- :electric_plug: [Plugin options](./plugin-options.md)
- :boat: [Migrating from other WP source plugins](./migrating-from-other-wp-source-plugins.md)
- :house: [Hosting WordPress](./hosting.md)
- :athletic_shoe: [Themes, Starters, and Examples](./themes-starters-examples.md)
- :medal_sports: [Usage with popular WPGraphQL extensions](./usage-with-popular-wp-graphql-extensions.md)
- :hammer_and_wrench: [Debugging and troubleshooting](./debugging-and-troubleshooting.md)
- :national_park: [Community and Support](./community-and-support.md)
- :point_left: [Back to README.md](../README.md)
