import React from "react"

const IndicatorButtonTooltip = ({
  onClick,
  tooltipLinkImage,
  tooltipLink,
  overrideShowTooltip,
  showTooltip,
  tooltipText,
  tooltipIcon,
  toolTipOffset,
  testId
}) => (
  <div
    onClick={onClick}
    style={{ top: `${toolTipOffset}px` }}
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
