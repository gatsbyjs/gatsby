---
title: How to Make a Minimal Reproduction
---

## What is a reproducible test case?

A reproducible test case is a small Gatsby site built to demonstrate a problem - often this problem is caused by a bug in Gatsby, Gatsby plugin or user code. Your reproducible test case should contain the bare minimum features needed to clearly demonstrate the bug.

## Why should you create a reproducible test case?

A reproducible test case lets you isolate the cause of a problem, which is the first step towards fixing it!

The [most important part of any bug report](https://developer.mozilla.org/en-US/docs/Mozilla/QA/Bug_writing_guidelines#Writing_precise_steps_to_reproduce) is to describe the exact steps needed to reproduce the bug.

A reproducible test case is a great way to share a specific environment that causes a bug. Your reproducible test case is the best way to help people that want to help _you_.

## Steps to create a reproducible test case
- Install Gatsby CLI if you haven’t using this [guide](https://www.gatsbyjs.com/docs/reference/gatsby-cli/).
- Create a new Gatsby site with a starter, the official `gatsby-starter-minimal` starter is a great 'barebones' starting point here: `gatsby new bug-repro https://github.com/gatsbyjs/gatsby-starter-minimal` There are other Gatsby starters you can use [here](https://www.gatsbyjs.com/starters/)
- Add any Gatsby plugins that relate to the issue. For example, if you're having problems with Gatsby MDX you should install and configure [`gatsby-plugin-mdx`](/plugins/gatsby-plugin-mdx/) in the directory of your site (i.e bug-repro). Remember to update your `gatsby-config.js` with the plugin you installed and only add plugins that are needed to demonstrate the problem.
- Add the code needed to recreate the error you've seen.
- Build the site locally using `gatsby develop` and confirm you’re not seeing any errors.
- Publish the code (your GitHub account is a good place to do this)
- Use the repo to build a site on Gatsby cloud and look out for any build errors.
- Share the link to the repo and build logs when reaching out to support. You can also share the repo if you’re [creating an issue](https://www.gatsbyjs.com/contributing/how-to-file-an-issue/)

## Benefits of reproducible test cases

- Smaller surface area: By removing everything but the error, you don't have to dig to find the bug.
- No need to publish secret code: You might not be able to publish your main site (for many reasons). Remaking a small part of it as a reproducible test case allows you to publicly demonstrate a problem without exposing any secret code.
- Proof of the bug: Sometimes a bug is caused by some combination of settings on your machine. A reproducible test case allows contributors to pull down your build and test it on their machines as well. This helps verify and narrow down the cause of a problem.
- Get help with fixing your bug: If someone else can reproduce your problem, they often have a good chance of fixing the problem. It's almost impossible to fix a bug without first being able to reproduce it.

## **What if I’m unable to create a reproducible test case?**

For Gatsby Cloud users, If you can’t create a reproducible test case, you can grant us access to you site by giving us repo permissions to reproduce the issue, creating a video of the issue preferably with [loom](https://www.loom.com/). if it’s an issue with your CMS, you can share the credentials( or create an account for us using support@gatsbyjs.com) and the reproduction steps.

### **For Build issues:**

1. Link to the failed build as seen [here](https://support.gatsbyjs.com/hc/en-us/articles/360053099173-Build-Logs)
2. Screenshot of the error
3. Workspace name
4. Link to the repo for the reproducible test case

### **For Hosting issues:**

1. Share the path to the problematic URL
2. What is the expected behavior of this URL?
3. What are you experiencing on your end?
4. Screenshot of the error message and screenshot of browser console

### **For CMS Issues:**

A reproduction would ideally include a minimal reproduction with access to a non-production CMS. When that isn’t possible, we can also use a production instance of the CMS with specific testing instructions that we are allowed to do in that environment.

1. Access to the CMS instance or an account created for support@gatsbyjs.com
2. Screenshot of the error and browser console logsI if applicable)
3. Video of the issue if possible

**Additional Context for all issues:**

For any kind of issue, share any other thing you have tried that may be helpful in further investigating this issue. I.e. I did xyz and got abc, If I change this, I see this.
