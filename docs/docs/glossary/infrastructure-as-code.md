---
title: Infrastructure as Code
disableTableOfContents: true
---

Learn what <q>Infrastructure as Code</q> means, and how you can use code to standardize and automate things.

## What is <q>Infrastructure as Code?</q>

_Infrastructure as Code_, or IaC, is the practice of managing your development, testing, and production environments using configuration files or scripts. Provisioning and configuring environments individually can introduce errors or inconsistencies. You may, for example, find yourself running different versions of Node.js on your laptop and your production servers. Infrastructure as Code minimizes this kind of drift and lets you automate the process of provisioning environments.

Your configuration file describes what resources your project requires. If you're building an API, for example, you might create a configuration file that says, "Please install Node.js 12.16.2, npm 6.14.4, Express 4.17.1, and PostgreSQL 12.2 for Ubuntu Linux." For a Gatsby project, your configuration file may add plugins and themes.

Configuration files, like other code files, are text. That means you can use version control software to store them and track changes to the environment. In short, IaC:

- Creates consistent environments.
- Saves time that would otherwise be spent setting up environments.
- Reduces the risk of errors caused by mismatched environments.
- Lays the groundwork for automation.

## Automating Gatsby site development with Gatsby Recipes

[Gatsby Recipes](/blog/2020-04-15-announcing-gatsby-recipes/) applies the infrastructure as code concept to front-end development. With Gatsby Recipes, you can automate common site building tasks, such as adding a plugin or test suite.

We've discontinued this experiment and you can use Gatsby versions up to `4.4.0` to still use it. The old code still lives [on GitHub](https://github.com/gatsbyjs/gatsby/tree/master/deprecated-packages/gatsby-recipes).
