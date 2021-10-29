import React from "react"

export default function IndicatorButtonTooltip({
  tooltipContent,
  overrideShowTooltip,
  showTooltip,
  testId,
  elementRef,
}) {
  const elmOffsetTop = () => {
    if (elementRef && elementRef.current) {
      const elm = elementRef.current
      return elm.offsetTop
    }
    return 0
  }
  return (
    <div
      data-gatsby-preview-indicator="tooltip"
      data-gatsby-preview-indicator-visible={`${
        overrideShowTooltip || showTooltip
      }`}
      data-testid={`${testId}-tooltip`}
      style={{ top: `${elmOffsetTop}px` }}
    >
      {tooltipContent}
    </div>
  )
}
