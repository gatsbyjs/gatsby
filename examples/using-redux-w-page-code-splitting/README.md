# Gatsby Redux Location Based Provider

## Goal

Only load the slice of the Redux store on a certain page.

## Why

Wrapping the entire Gatsby app in the Redux store is sometimes necessary. But other times, you may have a slice of the store that is only used on a certain page and you don't want unnecessary JS in the `app.js` bundle.

## Pattern

Moving the reducer out of the root store and in to a Provider that just wraps that page will remove it from the `app.js` bundle and put it only in that pages bundle. This prevents that reducer and its dependent JS from loading on pages where it is not used.

## Try it out

- Clone this repo
- `npm install`
- `npm run build`
- `npm run serve`
- Visit `/`, `/page-1`, and `other/page-1` in the browser and see how the large amount of Redux JS only ends up on `/page-1`.
