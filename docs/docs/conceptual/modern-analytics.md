The most popular analytics tools used by websites are Google Analytics and Google Tag Manager, each launched in the late 2000s. But in the last few years, there's been an explosion of web analytics services that give deeper insight into visitor behavior.

We've seen Gatsby teams reach for three categories of tools:

Customer Data Platforms (Segment, Rudderstack) are basically an orchestration layer for different analytics systems. Instead of using Google Tag Manager to drop in a number of trackers, teams can use one tracker, and the CDP service will handle sending out analytics to those tools. CDP includes event replay, letting teams switch out marketing tools while transferring the underlying data. Using a CDP can significantly improve page performance.

Blog post: [How WaveDirect Used Gatsby, Rudderstack, and Sanity to 4X Leads and Dominate Search Results](/blog/how-wavedirect-used-gatsby-rudderstack-and-sanity-to-4x-leads-and-dominate-search-results/)

Product analytics tools (Heap, Amplitude, Mixpanel) are aimed at giving more granular ways to segment users, measure the rate at which they performed specific actions, and compare groups of users to each other. They can also include tools, like cohort analyses, that are more relevant for SaaS apps than websites. Some (Heap) will auto-track all events, while others (Mixpanel, Amplitude) require users to define relevant events and trigger them in code.

Because product analytics tools produce quantitative data -- charts, graphs, and tables -- they are primarily used by demand generation teams to optimize user purchase and conversion rates.

Blog post: [Jaxxon: Gatsby + Shopify = Faster Growth](/blog/jaxxon-gatsby-shopify-faster-growth)

Session recording tools (FullStory, Hotjar) include heatmaps visualizing where users tended to click, and scrollmaps showing engagement drop-offs on landing pages. They overlay users' actions on page screenshots, and let teams track individual visitors' journey through your website.

Because session recording tools give individualized, qualitative data, they tend to be used by designers and UX researchers iterating on page design, layout and copy. In addition, session recordings are often cross-referenced by support teams from their ticketing and chat systems while they are communicating with customers.