import React, { useEffect, useRef, useState } from "react"
import { closeIcon } from "../icons"

export default function IndicatorButtonTooltip({
  content,
  overrideShow,
  show,
  testId,
  closable,
  onClose,
  onAppear,
  onDisappear,
}) {
  const tooltipRef = useRef(null)
  const [visible, setVisible] = useState(overrideShow || show)
  const onCloseClick = event => {
    event.preventDefault()
    if (onClose) {
      onClose()
    }
  }
  useEffect(() => {
    if (overrideShow || show) {
      setVisible(true)
    }
  }, [overrideShow, show])
  useEffect(() => {
    const onTransitionEnd = ({ propertyName }) => {
      if (propertyName === `opacity`) {
        const opacity = window
          .getComputedStyle(tooltipRef.current)
          .getPropertyValue(`opacity`)
        if (opacity === `0`) {
          if (onDisappear) {
            onDisappear()
          }
          setVisible(false)
        } else {
          if (onAppear) {
            onAppear()
          }
        }
      }
    }
    tooltipRef.current.addEventListener(`transitionend`, onTransitionEnd)
    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.removeEventListener(`transitionEnd`, onTransitionEnd)
      }
    }
  }, [])
  return (
    <div
      data-gatsby-preview-indicator="tooltip"
      data-gatsby-preview-indicator-visible={`${overrideShow || show}`}
      data-gatsby-preview-indicator-removed={`${!visible}`}
      data-testid={`${testId}-tooltip`}
      ref={tooltipRef}
    >
      <div data-gatsby-preview-indicator="tooltip-inner">
        {content}
        {closable && (
          <span
            data-gatsby-preview-indicator="tooltip-close-btn"
            onClick={onCloseClick}
          >
            {closeIcon}
          </span>
        )}
      </div>
    </div>
  )
}
