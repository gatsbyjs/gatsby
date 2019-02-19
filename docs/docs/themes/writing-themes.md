---
title: Writing Themes
---

- Create new project
  - Yarn workspace workflow
  - Name theme and update example

## Scaffold out the project

    gatsby new https://github.com/johno/gatsby-starter-theme

## **Yarn workspace workflow**

TODO: Introduce a yarn workspace workflow for running an example and the theme package together.

## **Principles**

- separating templates (with queries) and components
- accessing theme options
- base themes for data handling
- stylistic themes
- child theming
- documenting themes (potentially via automated tooling)

## **Considerations**

- renaming/reorganizing theme components is a breaking change (shadowing)
