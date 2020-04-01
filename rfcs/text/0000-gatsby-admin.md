- Start Date: 2020-03-31
- RFC PR:
- Gatsby Issue:

# Summary

Gatsby Admin is an interface to manage your Gatsby site, including pages, layouts, plugin and theme management, theme file shadowing, GraphQL, and more.

# Motivation

Managing your Gatsby site can be a tedious chore. You know what you want your site to be, but how do you tell Gatsby? You have to read the documentation to find the right configuration options. You have to dig through the plugin directory to find the ideal set of plugins and themes to use. All you want is to make your website!

Even harder is theme shadowing. You have to dig through your node_modules folder to figure out which files each of your themes has, and then you have to shadow them by putting them at very specific paths.

# Detailed design

We are working on [a patch that restarts the develop process whenever the configuration changes](https://github.com/gatsbyjs/gatsby/pull/22600), which is important for this to be usable. That requires us to split the `gatsby develop` command into two processes. We can leverage that to add a server to the parent process which will serve the Admin GraphQL API and interface.

After running `gatsby develop` locally, users can visit `localhost:8000/___admin` to see Gatsby Admin for their site. Because we serve the admin interface from the parent process, `/___admin` will stay accessible even when the users change the configuration and we restart the develop process.

Importantly, we will be developing this as a reusable framework ("SDK") that we could potentially reuse in gatsbyjs.com or eventual future desktop apps to expose similar information.

The initial throw-away prototype already supports:

1. Plugin and theme management
1. One-click theme shadowing

# Drawbacks

The main drawback is that Gatsby Admin could confuse users how they should configure their site. Thankfully, editing the configuration files manually vs. from Gatsby Admin is completely interoperable.

# Alternatives

N/A

# Adoption strategy

To keep our iteration speed as high as possible, we will develop this outside of core as its own package. Eventually, at some predetermined milestone we enable this by default in a SemVer-minor version of the `gatsby` package.

# How we teach this

The hardest part is the name. "Gatsby Admin" is similar to WPAdmin/phpMyAdmin, which quickly lets users grasp what it does by hearing the name. However, it could conflict with some gatsbyjs.com future efforts.

# Unresolved questions

- What else could Gatsby Admin be useful for? Can you think of any features that you would love to include?
- At which milestone should we enable this by default for all Gatsby sites?
- What should we call this? Are there any better names than “Admin”?
