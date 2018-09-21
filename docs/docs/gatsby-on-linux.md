---
title: Gatsby on Linux
---

# Linux

TODO

## Windows Subsystem Linux (WSL)

As of October 17th 2017, Windows 10 ships with WSL and Linux distributions are available via the [Windows Store], there are several different distributions to use which can be configured via `wslconfig` if you have more than one distribution installed.

```sh
# set default distribution to Ubuntu
wslconfig /setdefault ubuntu
```

### Using Windows Subsystem Linux: Ubuntu

If you have a fresh install of Ubuntu then update and upgrade:

```sh
sudo apt update
sudo apt -y upgrade
```

> Only use `-y` if you're happy to upgrade to the latest versions of the software.

**Build tools**

To compile and install native addons from npm you may also need to install build tools for `node-gyp`:

```sh
sudo apt install -y build-essential
```

**Install node**

Following the install instructions on nodejs.org leaves a slightly broken install (i.e. permission errors when trying to `npm install`). Instead try installing node versions using [n] which you can install with [n-install]:

```sh
curl -L https://git.io/n-install | bash
```

There are other alternatives for managing your node versions such as [nvm] but this is known to slow down [bash startup] on WSL.

### Using Windows Subsystem Linux: Debian

Debian setup is nearly identical to Ubuntu except for the additional installs of `git` and `libpng-dev`.

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

[windows store]: https://www.microsoft.com/en-us/store/p/ubuntu/9nblggh4msv6
[n]: https://github.com/tj/n
[n-install]: https://github.com/mklement0/n-install
[nvm]: https://github.com/creationix/nvm
[bash startup]: https://github.com/Microsoft/WSL/issues/776#issuecomment-266112578
