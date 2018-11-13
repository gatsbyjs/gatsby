module.exports = {
  processors: [`stylelint-processor-styled-components`],
  extends: [
    `stylelint-config-recommended`,
    `stylelint-config-styled-components`,
  ],
  rules: {
    "no-descending-specificity": null,
    "property-no-unknown": [
      true,
      {
        ignoreProperties: [`webkit-font-smoothing`],
      },
    ],
  },
}
