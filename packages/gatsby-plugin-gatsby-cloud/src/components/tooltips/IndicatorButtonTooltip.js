import React from "react"

export default function IndicatorButtonTooltip({
  tooltipContent,
  overrideShowTooltip,
  showTooltip,
  buttonIndex,
  testId,
}) {
  return (
    <div
      // The tooltip offset needs to be 40 * button possition (0 indexed) + 12
      // This will align the tooltip with its correct button
      // The first button is (40 * 0) + 12
      // The second button is (40 * 1) + 12 ...
      style={{ top: `${(buttonIndex || 0) * 40 + 12}px` }}
      data-gatsby-preview-indicator="tooltip"
      data-gatsby-preview-indicator-visible={`${
        overrideShowTooltip || showTooltip
      }`}
      data-testid={`${testId}-tooltip`}
    >
      {tooltipContent}
    </div>
  )
}
