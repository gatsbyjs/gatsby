# Architecture

This doc goes over the high level areas of this plugin, roughly what they do, and how they're related.

## gatsby-node.ts steps

In `src/gatsby-node.ts` a helper (`runApisInSteps`) is being used to run different "steps" of the codebase in order. Many parts of the codebase count on something else happening before so this is an easy way to visualize that while automatically adding error boundaries.

This file is the entry point for 99% of the plugin (`src/gatsby-browser.ts` only imports 1 css file) so it's a good jumping off point for looking at different areas of the plugin.

##

- Schema customization
- query generation
- interactions between schema customization and query generation
- sourcing nodes
- preview
- compatibility api (security feature-ish)
- we're using rematch which is a redux wrapper
- gatsby node api helpers/actions are stored in local redux (not gatsby redux)
- caching
- hard caching

## onPreInit

## pluginOptionsSchema

## createSchemaCustomization

## sourceNodes

## onPreExtractQueries

## onPostBuild

## onCreatePage

## onCreateDevServer
