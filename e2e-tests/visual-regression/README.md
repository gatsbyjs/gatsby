# Visual regression tests

This test suite uses [cypress-image-snapshot](https://github.com/jaredpalmer/cypress-image-snapshot)
to compare screenshots of pages or elements with a saved snapshot.

To add a test, add a page to `src/pages`, then add a test to `cypress/integration`, or add to an existing spec.

If tests fail, a comparison image will be written to `__diff_output__`. When running in CircleCI, this is uploaded to artifacts.

## Considerations

Remember that the test will run on Linux in CI, so avoid tests that might change between platforms.
Using default fonts is an example. In general, if you're not testing the text itself then exclude it from your tests. Rather than comparing the full page, a good idea is to compare a wrapper element. There is a component provided for this purpose for images.

Specifying large screen sizes can also cause problems when running locally on a small screen. The image tests use a maximum of 1024x768. The device pixel density is forced to 1, so running tests will look strange on Retina screens. This is to ensure screenshots match, whichever monitor or headless CI the tests rae running on.

## Updating snapshots

Run `yarn cy:update-snapshots` if you need to update them. Please note that unlike Jest, this doesn't delete outdated snapshots, so if you remove a test make sure to remove its snapshots too.

## Credits

Test images of Cornwall by [Benjamin Elliott](https://unsplash.com/photos/lH0_kBu5iyo) and [Red Zeppelin](https://unsplash.com/photos/uJMxXtH-Qso) via Unsplash.
