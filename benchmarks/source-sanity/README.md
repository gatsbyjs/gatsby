# Sanity Will it Build Example

Example page for Sanity as a source for "Will It Build".
Should/Will be generalized into e.g. a theme.

Queries the title, body and a cover image from Sanity. Creates pages for that and displays those three things as "Articles".
Those individual article pages and the homepage share a common "Layout" component (in src/components) that can be swapped (layout_1.js and layout_2.js) to simulate a code change in multiple pages.

## Update script

Make sure to add the environment variables in the `.env.example` file. To run the update script, you need to add a write token as well.

```
yarn update-post
```
