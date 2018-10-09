---
title: "Using VS Code for Supercharged Gatsby.js Development"
author: Michael Holtzman
date: 2018-10-09
tags: ["editor", "source", "documentation"]
---

The Gatsby.js platform and ecosystem is composed not only of the [core Inkteam members](https://www.gatsbyjs.com/about/), but a huge group of community members as well. I have no doubt that part of the success of Gatbsy is due to the core team really encouraging the community to be involved. They even give you [free swag for becoming a contributor](/docs/contributor-swag/).

Now that I have convinced you to get involved, the first thing you should do is review the existing [how to contribute guide](/docs/how-to-contribute/). That will go over the basics of checking out the project and getting set up.

The remainder of the article will talk about using VS Code if you want to contribute to the core [Gatsby project](https://github.com/gatsbyjs/gatsby). That being said everything mentioned here can be applied to just about any JavaScript project.

## Editors - Make Your Selection

![Lots of Available Options](./images/color-wall.jpeg)

I know that there are as many choices for IDE editors and personal preferences as there are JS frameworks in existence (hint LOTS). I am not going to debate those here, this article will focus on [VS Code](https://code.visualstudio.com/). It's the editor I use and find it amazing for the Javascript and web development ecosystem. I was a long time holdout using Sublime Text, but once I gave Code a try I switched over within a day and haven't looked back.

## Enough Talk, Let's get Started

First thing to do is [download VS Code](https://code.visualstudio.com/download) for your given OS platform. Ater opening the Editor and getting comfortable with the various screens, you'll notice one of the main views is the [Extensions tab](https://marketplace.visualstudio.com/VSCode). This is where the rubber meets the road, as these extensions **really enhance** the capabilities and productivity you'll realize using Code.

## Let's Talk Extensions

![Install all the Extensions](./images/install-meme.jpg)

OK, not quite, if you browse the list you will notice there are _A LOT_. I'm going to review some popular ones that are applicable to contributing to the Gatsby.js GitHub repo.

### ✅ Code linting and Formatting

The main [Gatsby GitHub repo](https://github.com/gatsbyjs/gatsby) has configuration files in place already for [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/). VS Code has extensions for both of these, which makes development really easy.

To get started, go to the Extensions View and [search](https://code.visualstudio.com/docs/editor/extension-gallery#_browse-for-extensions) for these plugins and press the green Install button for each. You may have to reload Code for the Extensions to take effect.

- Prettier - Code formatter
- ESLint

Now as you view, create, and modify files ESLint will display "squiggles" for warnings and errors in your files according to the existing rules already configured. You can correct any issues as you go.

For Prettier, you have two options. You can either run the Format manually, using `CMD + Shift + P -> Format Document`. This will format the currently open File.

The other option is to configure Prettier to Format on Save. You can enable the setting `editor.formatOnSave` by [editing the Preferences](https://code.visualstudio.com/docs/getstarted/settings) and applying this at the _User_, _Workspace_, or _Folder_ level.

### Other Fun Plugins

Of course once you start browsing the Extensions Marketplace you'll want to install additional plugins. Here is a short-list of _must-have_ plugins you should consider installing.

- Babel ES6/ES7
- JSON Tools
- markdownlint
- Rainbow Brackets
- vscode-icons

You can take a look at my ["dotfiles" Github](https://github.com/mikelax/dotfiles/tree/master/vscode) for a README on the VS Code Extensions I am using along with editor settings.

## 🚀 Debugging in Chrome 🚀

VS Code has a built-in debugger to enable proper runtime debugging, if you want to move past the `console.log` throught your code. Use the following steps to be up and (debugging) in minutes.

1. Install the [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome) Extension for VS Code.
1. In the Debug view, click the Debug Dropdown in the Panel and select the option `Add Config (projectname)`. This will create a `launch.json` file in your `.vscode` subfolder in the given project. Add the following to this file.

_NOTE_: You most likley will want to add the `.vscode` folder to your `.gitignore` file so it is not checked into source.

```json5
// launch.json
{
  version: "0.2.0",
  configurations: [
    {
      type: "chrome",
      request: "launch",
      name: "Launch Chrome for Gatsby site",
      url: "http://localhost:8000",
      webRoot: "${workspaceFolder}",
    },
  ],
}
```

## Conclusion

In this article we have learned some of the basics about configuring and using VS Code for development on the Gatsby project. The Extensions and configuration discussed here can be applied though to a project that **uses** Gatsby just the same.

You may want to browse through the [Code Updates page](https://code.visualstudio.com/updates/) to see some of the recent features added. You'll notice they publish major updates monthly. It seems they are listening to the user community and continually adding features to the Editor and improvements to the user expereince.

Do you use an Extension that I missed in this tutorial? Send send a message to [@mikelax on Twitter](https://twitter.com/mikelax) to let me know.
