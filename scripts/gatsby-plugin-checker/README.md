# gatsby-plugin-checker

This script searches the npm API for plugins that start with either "gatsby-source", "gatsby-plugin", or "gatsby-transformer" but don't have the "gatsby-plugin" keyword in their `package.json` and thus are not included in Gatsby's keyword search. The script will then notify those repositories by creating an issue notifying them to add the keyword to their `package.json` (This functionality will be included in the next commit). Once a repo has been notified, its `notified` attribute will be changed to `true` in `plugins.json` and won't be notified. Similarly, if a repo is a false positive or doesn't want to be notified, it can be `blacklisted`.

To run this script you need to:

1. Create a `.env` file in this directory (You shouldn't commit this file)
1. Add a variable called `GITHUB_API_TOKEN` and set it to your Personal Access token (Find instructions for generating this [here](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line))
