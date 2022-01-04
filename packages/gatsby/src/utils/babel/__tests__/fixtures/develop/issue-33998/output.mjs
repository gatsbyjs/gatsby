import { createStitches } from '@stitches/react';
// THIS IS WRONG (added comment to snapshot to fail tests - apparently borked
// that would fail in runtime is not automatically failing the tests):
// - `_createStitches` is not defined
// - additionally config is no longer exported (even tho this is not page template)
//
// the heart of it seems to be `babel-plugin-remove-api`
// but if you drop `react-refresh` plugin it looks better - `_createStitches` is there
var styled = _createStitches.styled,
    css = _createStitches.css,
    globalCss = _createStitches.globalCss,
    keyframes = _createStitches.keyframes,
    getCssText = _createStitches.getCssText,
    theme = _createStitches.theme,
    createTheme = _createStitches.createTheme,
    config = _createStitches.config;
export { styled, css, globalCss, keyframes, getCssText, theme, createTheme };
