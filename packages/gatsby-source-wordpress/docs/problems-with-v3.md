# Problems with Gatsby Source WordPress v3 :broken_heart:

`gatsby-source-wordpress@v3`, the last major version of this plugin, utilized the [WP REST API](https://developer.wordpress.org/rest-api/) for sourcing WP data into Gatsby. This worked but was problematic for a few reasons.

- The inflexibility and lack of an enforced schema for this API made proper node caching technically possible but functionally impossible. It also made it impossible to know beforehand the shape and type of data to expect which made it impossible to programmatically determine how to use the returned data.
- The REST API is largely untyped, and REST does not enforce typing even if it was.
  - This means Gatsby needed to use [inference](https://www.gatsbyjs.com/docs/glossary/#inference) to automatically build GraphQL types for the data that was returned from WP. The big issue with this is: if all data of a type is removed from WP, your Gatsby site's GraphQL queries will break because no data means Gatsby can no longer can infer the data structure. This led to a lot of odd and counterintuitive issues and a poor developer/content creator experience.
  - If we were to manually write out types for the entire core WP REST API so that we no longer needed to use inference, any custom WP REST plugins would not work and would require a lot of additional tedious and error prone work to support these plugins changing their data structure over time.
- REST does not have a popularly used standard way of implementing connections between nodes
  - For example if you fetch 100 posts, you will also be fetching repeated data if each post includes data about the posts author including their name and email, etc. Perhaps all the posts had the same author and so we fetched 100x more data than we needed to.
  - Even if WP REST API core implemented a standard way to retrieve connections to prevent overfetching connected data, any WP REST API extensions, community or otherwise, may or may not adhere to this standard, causing a large problem and stunting the ability for the community to easily extend the integration between WP and Gatsby. This would also mean a Gatsby plugin would need to be written for every single WP REST API extension, ballooning the amount of support needed for the WP/Gatsby integration to flourish.
- Being that the WP REST API is part of WordPress core, developments, bug fixes, and improvements to it move very slowly. There has been an open issue about broken media items for 4 years with no resolution in sight. This bug occasionally breaks Gatsby builds due to improperly missing media items. This leads to poor DX and cryptic error messages. Fixing this bug in a WP instance requires opening an SQL client and manually patching your DB each time this bug occurs.
- The WP REST API does not support many basic types of WP data such as menus, previews, plugins, themes.

All of the above points are fixed by using this plugin and WPGraphQL :smile_cat:

# Up Next :point_right:

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
