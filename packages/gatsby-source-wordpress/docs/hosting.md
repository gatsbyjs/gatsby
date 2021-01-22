# Hosting WordPress :house:

Any mid-to-high performance WordPress host will work great. You may also have success on low performance WordPress hosts for smaller or medium sized sites, but a better server is recommended.

A great Gatsby/WordPress workflow is to use [Local by Flywheel](https://localwp.com/) for hosting your local WordPress server and then pushing from there to [Flywheel](https://getflywheel.com/) or [WPEngine](https://wpengine.com/) hosting for your live/staging WordPress servers.

If you have a very large site (with a lot of images), you may need to ask your hosting provider to remove IP rate limiting for your IP addresses as this source plugin will try to fetch them as fast as it can to speed up your build times.

If your server becomes overwhelmed by the number of requests being made from Gatsby to WP during an uncached build, your build may fail. You can fix this by lowering the `GATSBY_CONCURRENT_DOWNLOAD` env var. It is set to 200 by default and a good server can handle this. Some servers may require this to be set as low as 5 or 10. Try a few different settings to determine how many concurrent requests your server can handle. The higher this number can be set, the faster your uncached builds will become.

# Up Next :point_right:

- :athletic_shoe: [Themes, Starters, and Examples](./themes-starters-examples.md)
- :medal_sports: [Usage with popular WPGraphQL extensions](./usage-with-popular-wp-graphql-extensions.md)
- :hammer_and_wrench: [Debugging and troubleshooting](./debugging-and-troubleshooting.md)
- :national_park: [Community and Support](./community-and-support.md)
- :point_left: [Back to README.md](../README.md)
