- Start Date: 2020-02-27
- RFC PR: https://github.com/gatsbyjs/gatsby/pull/21798

# Summary

Gatsby’s codebase is large and filled with complex data types that carry a difficult mental model for developers. By switching to TypeScript, contributors to Gatsby’s codebase will gain the benefits of a type language including type safety, self documentation and IDE support. Typed languages are known to be less brittle and encourage smart coding practices.

To be clear, this RFC is not to enable TS for users, but only to convert gatsby's core codebase to TS internally.

# Motivation

As maintainers of a large, complex codebase and ecosystem we need tools and systems that helps us ship the highest quality code. There are numerous examples of bugs that were due to simple code issues that are solvable by type systems. Issues like, calling a function with the wrong arguments, dynamically adding properties to an object at runtime and not knowing if the property is available at a specific instance of the stack, expecting a variable to be a specific type and not handling the case of a different type, etc.

The cost of time and churn required for a user who experiences a menial bug is high. The user has to be motivated to dig into the bug, report an issue, wait for a fix or contribute a fix, then upgrade to a new release. There is very real cost to our users, and a high chance of churn if a user experiences this early in their pursuit of trying Gatsby. Utilizing a type system is not a silver bullet, but it will greatly reduce the rate at which we ship menial bugs.

# Detailed design

The following packages will be converted to TypeScript:

- babel-plugin-remove-graphql-queries
- babel-preset-gatsby
- babel-preset-gatsby-package
- gatsby
- gatsby-cli
- gatsby-core-utils
- gatsby-image
- gatsby-link
- gatsby-page-utils
- gatsby-telemetry
- gatsby-react-router-scroll

# Drawbacks

Reasons to not consider this are the time investment, the community impact, and the reality that TypeScript is not a sound type system. Of course any refactor requires time and interation, but one of the benefits is that we'll absolutely discover and fix bugs along the way. The community impact is hard to measure, but there is surely going to be someone who wants to contribute to Gatsby, but becomes overwhelmed by not knowing TS. This is unfortunate, but I believe the benefits outweigh this risk. It is slightly uncommon for the community to contribute to Gatsby's core. When we do receive community contributions, they are very impressive and there is likely a bet those PRs would still be submitted with TS support. Lastly, TypeScript is not a truly sound type language. So while we will get benefits of a type system, it will not be fully error proof.

# Alternatives

Flow. Unfortunately, it is less mature, has a less robust ecosystem, and will require us to manually type 3rd party libraries. The main downside to Flow is the non-strictness it has. TypeScript can fail builds if it is not typed soundly, and this is a huge benefit actually. Flow not having that allows you to run down rabbit holes of unsound code until you finlly run aflow and are told of your problems.

Other alternatives would be a different language like Reason or Rust + WASM.

# Adoption strategy

Here are the steps to setup a package to use TS:

1. Add a tsconfig.json to the package with an `"extends": "../../tsconfig.json"` entry.
2. Begin changing files from .js to .ts and adding types!

Spending all of our time on a rewrite is not the goal. Adoption should be incremental, but focused. There are real wins to be had if we can have 100% TS migration, so that is the goal. In general, this is the philosophy to be had: If you are working on a feature or fix, any file you touch consider if you can easily switch it to TS. If so, do it.

Additionally we will be **heavily** relying on the community to make this conversion happen. We will create a detailed issue with work to be completed and anyone can get involved!

Once we hit 85% TypeScript migration, we will then make it a specific action to invest our time in switching files to reach 100%. Having 100% coverage brings the value of having the most sound codebase, the most IDE integration and the ability to use `tsc` as our build tool instead of babel.

# How we teach this

Internally we can work hand-in-hand with developers who do not have experience in typed languages. Externally, there are many resources around the web to learn and practice.
