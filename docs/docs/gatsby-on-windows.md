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

### If `gatsby build` or `npm install` fails you might want to try this

Sometimes the `windows-build-tools` won't properly install required libraries. This is true if you already have a regular .NET development environment setup. This has been reported on Windows 10 x64 (and possibly other architectures or Windows versions).

This might be your problem if after running `npm install` on a Gatsby site, you see compilation errors such as `node-gyp` or `sharp` or `binding.gyp not found`.

If you suspect this is your problem, download the [Visual Studio Express 2015 Package](https://www.visualstudio.com/products/visual-studio-community-vs) and install the package `Programming languages > Visual C++ > Common tools for Visual Studio 2015`. You can uncheck everything else. You don't need to install the full VS2015 Express on your system and this won't mess up your existing VS201x installs.

Then run the commands on Gatsby:

`npm uninstall node-gyp -g`

`npm config set python python2.7`

`npm config set msvs_version 2015`

`npm cache clean -f`

`npm install`

You should then be all set.

If that still doesn't work, refer to the [`node-gyp` npm package homepage](https://www.npmjs.com/package/node-gyp) for further instructions and contact the `node-gyp`team on [GitHub](https://github.com/nodejs/node-gyp/issues).
