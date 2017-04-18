---
title: Gatsby on windows
---

## Setting up your environment for building native Node.js modules.

Many Gatsby plugins and themes require building native Node.js modules e.g.
[Sharp (a common Gatsby dependency used for image
processing)](/docs/packages/gatsby-plugin-sharp/). To do so, you need a
functional build environment (Python and Visual C++ Build Tools).

The easy way to setup your build environment on Windows is to install the
[`windows-build-tools`](https://github.com/felixrieseberg/windows-build-tools)
package by runnning `npm install --global windows-build-tools` on an admin
powershell console. On installing this package, it downloads and installs the
Visual C++ Build Tools 2015, provided free of charge by Microsoft. These tools
are required to compile popular native modules. It will also install Python
2.7, configuring your machine and npm appropriately.

## Installing dependencies without troubles.

Run `yarn` or `npm i` in **a powershell console** to have a correct build (some issues with sharp and sqlite3 with a bash console)