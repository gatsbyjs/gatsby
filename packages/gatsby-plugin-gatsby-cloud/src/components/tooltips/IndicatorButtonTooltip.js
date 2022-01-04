import React, { useEffect, useRef, useState } from "react"

export default function IndicatorButtonTooltip({
  tooltipContent,
  overrideShowTooltip,
  showTooltip,
  testId,
}) {
  const tooltipRef = useRef(null)
  const [visible, setVisible] = useState(overrideShowTooltip || showTooltip)
  useEffect(() => {
    if (overrideShowTooltip || showTooltip) {
      setVisible(true)
    }
  }, [overrideShowTooltip, showTooltip])
  useEffect(() => {
    const onTransitionEnd = ({ propertyName }) => {
      if (propertyName === `opacity`) {
        const opacity = window
          .getComputedStyle(tooltipRef.current)
          .getPropertyValue(`opacity`)
        if (opacity === `0`) {
          setVisible(false)
        }
      }
    }
    tooltipRef.current.addEventListener(`transitionend`, onTransitionEnd)
    return () => {
      tooltipRef.current.removeEventListener(`transitionEnd`, onTransitionEnd)
    }
  }, [])
  return (
    <div
      data-gatsby-preview-indicator="tooltip"
      data-gatsby-preview-indicator-visible={`${
        overrideShowTooltip || showTooltip
      }`}
      data-gatsby-preview-indicator-removed={`${!visible}`}
      data-testid={`${testId}-tooltip`}
      ref={tooltipRef}
    >
      <div data-gatsby-preview-indicator="tooltip-inner">{tooltipContent}</div>
    </div>
  )
}
