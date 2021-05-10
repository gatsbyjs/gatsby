---
title: Code Contributions
---

The beauty of contributing to open source is that you can clone your favorite project, get it running locally, and test out experiments and changes in real time! Way to feel like a wizard.

## Repo setup

This page includes details specific to the Gatsby core and ecosystem codebase.

To start setting up the Gatsby repo on your machine using git, Yarn and Gatsby-CLI, check out the page on [setting up your local dev environment](/contributing/setting-up-your-local-dev-environment/).

Alternatively, you can skip the local setup and [use an online dev environment](/contributing/using-an-online-dev-environment/).

To contribute to the blog, check out the setup steps on the [blog contributions](/contributing/blog-contributions/) page. For instructions on contributing to the docs, visit the [docs contributions page](/contributing/docs-contributions/).

## Creating your own plugins and loaders

If you create a loader or plugin, we would love for you to open source it and put it on npm. For more information on creating custom plugins, please see the documentation for [plugins](/docs/plugins/) and the [API specification](/docs/api-specification/).

## Contributing example sites

Gatsby's policy is that "Using" example sites (like those in the [examples part of the repo](https://github.com/gatsbyjs/gatsby/tree/master/examples)) should only be around plugins that are maintained by the core team as it's hard to keep things up to date otherwise.

To contribute example sites, it is recommended to create your own GitHub repo and link to it from your source plugin, etc.

## Using Docker to set up test environments

With all of the possible Gatsby integrations, it might help to spin up a Docker container with the software application you need to test. This makes installation a breeze, so you can focus less on getting set up and more on the integration details that matter to you.

> Do you have a setup not listed here? Let us know by adding it to this file and opening a PR.

### Docker, WordPress and Gatsby

To install WordPress to use with Gatsby, this `docker-compose.yml` file will come in handy:

```yaml:title=docker-compose.yml
version: "2"

services:
  db:
    image: mysql:5.6
    container_name: sessions_db
    ports:
      - "3306:3306"
    volumes:
      - "./.data/db:/var/lib/mysql"
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: wordpress
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress

  wordpress:
    image: wordpress:latest
    container_name: sessions_wordpress
    depends_on:
      - db
    links:
      - db
    ports:
      - "7000:80"
    restart: always
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_PASSWORD: wordpress
    volumes:
      - ./wp-content:/var/www/html/wp-content
      - ./wp-app:/var/www/html

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    container_name: sessions_phpmyadmin
    environment:
      - PMA_ARBITRARY=1
      - PMA_HOST=sessions_db
      - PMA_USER=wordpress
      - PMA_PASSWORD=wordpress
    restart: always
    ports:
      - 8080:80
    volumes:
      - /sessions
```

Use the above file contents when following the Docker WordPress install instructions: https://docs.docker.com/compose/wordpress/

Using Docker Compose, you can start and stop a WordPress instance and integrate it with the [Gatsby WordPress source plugin](/docs/sourcing-from-wordpress/).

## Development tools

### Debugging the build process

Check [Debugging the build process](/docs/debugging-the-build-process/) page to learn how to debug Gatsby.

## Official theme development

This section is for official theme development. If you are looking
to build your own theme, see [building themes](/docs/themes/building-themes/).

Themes live in their own [repo](https://github.com/gatsbyjs/themes). The themes themselves live in the `packages` directory and starters using them are in the `starters` directory. In order to work on a theme, find the starter that uses it and do the following:

1. Run `yarn` in your terminal in the root of the repo.
2. Still in the repo root, run `yarn workspace <starter name> develop`.

From there, you can make changes in the theme and see them reflected in the running site.

## Feedback

At any point during the contributing process the Gatsby team would love to help! For help with a specific problem you can [open an issue on GitHub](/contributing/how-to-file-an-issue/). Or drop in to [our Discord server](https://gatsby.dev/discord) for general community discussion and support.
