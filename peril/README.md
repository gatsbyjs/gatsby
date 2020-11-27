# Gatsby's Peril Settings

This is the configuration repo for Peril on the GatsbyJS org. There’s a [settings file](../peril.settings.json) and org-wide dangerfiles which are inside the [rules folder](rules).

## tl;dr for this repo

Peril is Danger running on a web-server and this repo is the configuration for that. Currently the dangerfiles in [rules](rules/) run on every issue and pull request for all GatsbyJS Repos.

## How it works

### Relevant tools

Here are links to the relevant tools, docs, and apps we’re using:

- [Peril](https://github.com/danger/peril)
- [Danger JS](http://danger.systems/js/)
- [Peril for Orgs](https://github.com/danger/peril/blob/master/docs/setup_for_org.md)
- [Peril on the GatsbyJS Heroku team](https://dashboard.heroku.com/apps/gatsby-peril)

### How the pieces fit together

There are three parts to enabling automations on the Gatsby GitHub organization (ignoring some of the nitty-gritty details). Those parts are:

- Events (issue comments, new pull requests etc) published from the Gatsby GitHub org to a server
- An instance of Peril which receives and responds to those events
- This settings repo which configures rules for the Peril instance

![Gatsby Peril event sequence diagram](https://user-images.githubusercontent.com/381801/46957219-048c3b80-d08f-11e8-829c-b535a4a122f3.png)

> [View source for the diagram](https://sequencediagram.org/index.html#initialData=C4S2BsFMAIHEENgGcBGBPaAFSAnE5pIA3SAO2GiUgEcBXMgY0gChnSB7YGdknORVBlhgAErRTR2OAOYAuAKIly0ABbwADurJJJpaPH7J00HJHXtmCI0NHjJMgLQA+aQPQOtecADoVudgDWtBrq3gzsALYKShQA7pAoKuyBrMyu1h64+L7+QSFhkc6e+A7pggBWOqbmsgDC7KQAZiDS+qQAJtDA8EgBVTT0SMCsHFySvNDF4KVuaJUmZuyyALLwGKbAtDh6EbTgoOpQ0O3wpNK4XT19rGXuUzk4gcGaBREAPJleM9bz1Uv1TRabU63V6-SQ5lIVFYVkEcFsEik0g+30En2yfkeeRe4SiACVaHpQQEFhCGu0QGcuuxCDEYbN4cAxIiZCjbmh0T5MU98rjZASiVdSZCKVTgDTiGRhpYGcImXYkWzZpyHjycZF+YTLr1heTKa1xbSpUA)

The Peril instance can also be configured to run events on a schedule.

### What is this project?

- [EmptyBody](./rules/emptybody.ts): Automatically requests more information from a user who opens a new issue with a blank body.

### To Develop

```shell
yarn install
code .
```

You will need node and yarn installed beforehand. You can get them both by running `brew install yarn`.

This will give you auto-completion and types for Danger mainly.

### To Deploy

Changes to [`tasks/`](./tasks) and [`rules/`](./rules) will automatically be picked up by the Heroku App.

Changes to [`peril.settings.json`](../peril.settings.json) require the Heroku App to be restarted.

Changes to `settings.modules` in [`peril.settings.json`](../peril.settings.json) require the app to be rebuilt on Heroku. This is to allow Heroku to install any new dependencies. See the repo for more info (TODO: add the repo).

### Debugging

Add the following env var to the Heroku app: `DEBUG=octokit:rest*`. This will enable debug output for the GitHub API library used by Peril, allowing you to see the exact API calls that are made to GitHub.

## Acknowledgments

Huge thanks to [@SD10](https://github.com/SD10) for the initial setup help and for additional guidance along the way.

And thanks to [@orta](https://github.com/orta) for creating [Peril](https://github.com/danger/peril). This makes our lives so much easier.

## Roadmap

See [this epic](https://github.com/gatsbyjs/gatsby/issues/6728) for additional work planned in this repo. (Works best with the [ZenHub extension](https://www.zenhub.com/extension).)
