import React from "react"

const IndicatorButtonTooltip = ({
  onClick,
  tooltipLinkImage,
  tooltipLink,
  overrideShowTooltip,
  showTooltip,
  tooltipText,
  tooltipIcon,
  buttonIndex,
  testId,
}) => (
  <div
    onClick={onClick}
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
    {tooltipIcon}
    {tooltipText}
    {tooltipLink && (
      <p data-gatsby-preview-indicator="tooltip-link">{tooltipLink}</p>
    )}
    {tooltipLinkImage && (
      <div data-gatsby-preview-indicator="tooltip-svg">{tooltipLinkImage}</div>
    )}
  </div>
)

export default IndicatorButtonTooltip
