---
title: Gatsby on Linux
---
# Linux

## Windows Subsystem Linux (WSL)

As of October 17th 2017 Windows 10 ships with Just for info for those that are not aware WSL has been available in Windows 10 via the Windows Store since the Fall Creators Update there will be a very large portion of developers that could use this instead of

### Using Windows Subsystem Linux: Ubuntu

If you have a fresh install of Ubuntu then update and upgrade:

```sh
sudo apt update
sudo apt -y upgrade
```

>Only use `-y` if you're happy to upgrade to the latest versions of the software.

**Build tools**

To compile and install native addons from npm you may also need to install build tools, I need this for Gatsby images which uses `sharp` which in turn uses `node-gyp`:

```sh
sudo apt install -y build-essential
```

**Install node**

If installing node via the instructions given on the nodejs.org site doesn't give the correct permissions i.e. permission errors when trying to `npm install` try using [n] instead, you can install it with [n-install]:



### Using Windows Subsystem Linux: Debian

```sh
sudo apt update
sudo apt -y upgrade
sudo apt install build-essential
sudo apt install git
sudo apt install libpng-dev
```

Or to install all at the same time and approve (y) all installs:

```sh
sudo apt update && sudo apt -y upgrade && sudo apt install build-essential && sudo apt install git && sudo apt install libpng-dev
```

<!-- links -->
[n]: https://github.com/tj/n
[n-install]: https://github.com/mklement0/n-install