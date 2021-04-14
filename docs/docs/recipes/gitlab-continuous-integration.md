---
title: "Recipes: Continuous Integration on GitLab"
tableOfContentsDepth: 1
---

Continuous Integration works by pushing small code chunks to your application’s code base hosted in a Git repository, and, to every push, run a pipeline of scripts to build, test, and validate the code changes before merging them into the main branch.
This recipe helps you set up CI/CD on GitLab and automate your production build!.

## Prerequisites

- Make sure you have the [Gatsby CLI](/docs/reference/gatsby-cli) installed
- A [GitLab](https://gitlab.com/) account

## Directions

1. Create a gatsby site

```shell
gatsby new {your-project-name}
```

2. Change directory and start a development server

```shell
cd {your-project-name}
gatsby develop
```

3. Stop your development server (`Ctrl + C` on your command line in most cases)

4. Create a `.gitlab-ci.yml` with the following content:

```yaml
image: node:latest

stages:
  - build

cache:
  paths:
    - node_modules/

install_dependencies:
  stage: build
  script:
    - npm install
  artifacts:
    paths:
      - node_modules/
```

3. `git push <you-remote-gitlab-repo>`
4. Check out your pipeline under the CI/CD option.

## Additional resources

- See how you can develop this file into something more real world [GitLab CI/CD Docs](https://docs.gitlab.com/ee/ci/README.html)
- Check this especially to learn how to make your newly build available for a next job - [GitLab Job Artifacts Docs](https://docs.gitlab.com/ee/ci/pipelines/job_artifacts.html)

- [Getting started with GitLab CI/CD](https://gitlab.com/help/ci/quick_start/README)
