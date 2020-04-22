---
title: "Recipes: Continuous Integration on Gitlab"
tableOfContentsDepth: 1
---

Push your code to gitlab and automate your production build!

### Prerequisites

- A [Gatsby site](/docs/quick-start)
- A [Gitlab](https://gitlab.com/) account 

### Directions

1. Stop your development server if it is running (`Ctrl + C` on your command line in most cases)

2. Create a `.gitlab-ci.yml` with the following content:

```
image: node:12.16.1

cache:
  paths:
    - node_modules/

stages:
  - build

build:
  stage: build
  script:
    - yarn
    - yarn build
```

3. `git push <you-remote-gitlab-repo>`
4. Check out your pipeline working!

### Additional resources

- See how you can develop this simple file into something more real world [Gitlab CI/CD Docs](https://docs.gitlab.com/ee/ci/README.html)
- Check this especially to learn how to make your newly build available for a next job - [Gitlab Job Artifacts Docs](https://docs.gitlab.com/ee/ci/pipelines/job_artifacts.html)
