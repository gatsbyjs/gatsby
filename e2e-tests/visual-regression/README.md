# Visual regression tests

This test suite uses [cypress-image-snapshot](https://github.com/jaredpalmer/cypress-image-snapshot)
to compare screenshots of pages or elements with a saved snapshot.

To add a test, add a page to `src/pages`, then add a test to `cypress/integration`.

## Considerations

Remember that the test will run on Linux in CI, so avoid tests that might change between platforms.
Using default fonts is an example. In general, if you're not testing the text itself then exclude it from your tests.

Rather than comparing the full page, a good idea is to compare a wrapper element.

## Updating snapshots

Run `yarn cy:update-snapshots` if you need to update them. Please note that unlike Jest, this doesn't delete outdated snapshots.
